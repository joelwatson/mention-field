Ext.define('Mention.Field', {
    extend: 'Ext.form.field.TextArea',
    alias: 'widget.mention-field',
    mixins: ['Ext.util.StoreHolder', 'Mention.mixin.Caret'],
    config: {
        /**
         * @cfg {String} displayField
         * The underlying {@link Ext.data.Field#name data field name} to bind to this ComboBox.
         *
         * See also `{@link #valueField}`.
         */
        displayField: 'text',
        /**
         * @cfg {String/String[]/Ext.XTemplate} [displayTpl]
         * The template to be used to display selected records inside the text field. An array of the selected records' data
         * will be passed to the template. Defaults to:
         *
         *     '<tpl for=".">' +
         *         '{[typeof values === "string" ? values : values["' + me.displayField + '"]]}' +
         *         '<tpl if="xindex < xcount">' + me.delimiter + '</tpl>' +
         *     '</tpl>'
         *
         * By default only the immediate data of the record is passed (no associated data). The {@link #getRecordDisplayData} can
         * be overridden to extend this.
         */
        displayTpl: false,
        /**
         * @cfg {String} imageField
         * The underlying {@link Ext.data.Field#name image field name} to bind to this ComboBox.
         */
        imageField: 'image',
        /**
         * @cfg {String} defaultImage
         * The default image to use if a value is not found for an image in the record when using `{@link #imageField}`
         */
        defaultImage: null,
        /**
         * @cfg {Boolean} includeImage
         * Whether or not to setup support for the default thumbnail tpl. Is required to be true if imageField is to be used
         */
        includeImage: false,
        /**
         * @cfg {Ext.data.Model} selection
         * The selected model. Typically used with {@link #bind binding}.
         */
        selection: null,
        /**
         * @cfg {String} mentionTrigger
         * The pattern to use for triggering a mention lookup when typing
         * Defaults to '@'
         */
        mentionTrigger: '@',
        /**
         * @cfg {String} mentionStartPattern
         * The pattern to use for the beginning "wrap" of a selected value in the raw text.
         * Defaults to '[~'
         */
        mentionStartPattern: '[~',
        /**
         * @cfg {String} mentionEndPattern
         * The pattern to use for the closing "wrap" of a selected value in the raw text.
         * Defaults to ']'
         */
        mentionEndPattern: ']'
    },
    ignoreKeys: [38, 40, 13, 27, 9],
    currentMatchOriginPos: null,
    constructor: function(config) {
        var me = this;
        // force field to be editable
        me.editable = true;
        // can't have multi-select
        me.multiSelect = false;
        // block typeAhead
        me.typeAhead = false;
        
        me.callParent(arguments);
    },
    initComponent: function() {
        var me = this,
            store = me.store,
            isLocalModel;
        
        me.bindStore(store || 'ext-empty-store', true, true);
        isLocalMode = me.queryMode === 'local';
        if (!Ext.isDefined(me.queryDelay)) {
            me.queryDelay = isLocalMode ? 10 : 500;
        }
        if (!Ext.isDefined(me.minChars)) {
            me.minChars = isLocalMode ? 0 : 4;
        }
        // ensure that necessary patterns are setup before continuing
        if (!me.mentionTrigger) {
            Ext.raise('A mentionTrigger (ex: "@") must be defined in order for this field to work -- please provide one.');
        }
        if (!me.mentionStartPattern) {
            Ext.raise('A mentionStartPattern (ex: "[~") must be defined in order for this field to work -- please provide one.');
        }
        if (!me.mentionEndPattern) {
            Ext.raise('A mentionEndPattern (ex: "]") must be defined in order for this field to work -- please provide one.');
        }
        // need to setup regexes with escapes based on provided patterns
        me.mentionTriggerRe = me.escapeStringForRegex(me.mentionTrigger);
        me.mentionStartRe = me.escapeStringForRegex(me.mentionStartPattern);
        me.mentionEndRe = me.escapeStringForRegex(me.mentionEndPattern);
        // setup support for image thumbnail tpl
        if(!me.tpl) {
            me.defaultListConfig.getInnerTpl = function(displayField) {
                var field = this.pickerField,
                    imageField = field.getImageField(),
                    defaultImage = field.getDefaultImage(),
                    includeImage = field.getIncludeImage(),
                    imageTpl = '';
                // only use if includeImage is turned on and defaultImage is defined
                if(includeImage && defaultImage && imageField) {
                    imageTpl = [
                        '<div class="x-boundlist-image" style="background-image: url(',
                            '<tpl if="' + imageField + '">',
                                '{'+ imageField + '}',
                            '<tpl else>',
                                defaultImage,
                            '</tpl>',
                        ');">',
                            '{' + displayField + '}',
                        '</div>'
                    ].join('');
                }
                else {
                    imageTpl = '{' + displayField + '}';
                }
                return imageTpl;
            }
        }
        me.callParent();
        // setup query task
        me.doQueryTask = new Ext.util.DelayedTask(me.doRawQuery, me);
    },
    /**
     * Escapes the passed string so that it will be safe for a regex
     * @param {String} value
     * @return {String}
     */
    escapeStringForRegex: function(value) {
        var regexEscapeRe = /[-\/\\^$*+?.()|[\]{}]/g,
            regexEscapeReplace = '\\$&';
        return value.replace(regexEscapeRe, regexEscapeReplace);
    },
    /**
     * Binds a store to this instance.
     * @param {Ext.data.AbstractStore/String} [store] The store to bind or ID of the store.
     * When no store given (or when `null` or `undefined` passed), unbinds the existing store.
     * @param {Boolean} [preventFilter] `true` to prevent any active filter from being activated
     * on the newly bound store. This is only valid when used with {@link #queryMode} `'local'`.
     */
    bindStore: function(store, preventFilter, /* private */ initial) {
        var me = this,
            filter = me.queryFilter;
            
        me.mixins.storeholder.bindStore.call(me, store, initial);
        store = me.getStore();
        if (store && filter && !preventFilter) {
            store.getFilters().add(filter);
        }
    },
    /**
     * Rationalizes the query based on the current caret position and parsing rules for lookups
     * @return {Object}
     */
    getQuery: function() {
        var me = this,
            value = this.getValue(),
            startPosition = me.getCaretPosition().start,
            lookup = me.getLookupPosition(),
            type = lookup.type,
            queryEnd = startPosition - lookup.position,
            substring = value.substr(lookup.position, queryEnd),
            replaceRe = new RegExp('^' + me.mentionStartRe + '|' + me.mentionTriggerRe);
        
        return {
            property: type === 'text' ? me.getDisplayField() : me.valueField,
            value: substring.replace(replaceRe, '')
        };
    },
    /**
     * Determines if the current caret position is within a query-able match (e.g., @something or [~something])
     * @return {Object}
     */
    getLookupPosition: function() {
        var me = this,
            value = this.getValue(),
            startPosition = me.getCaretPosition().start,
            lookup = {
                position: -1,
                mode: null
            },
            validMatch = false,
            triggerSearch = me.getMentionTrigger(),
            startSearch = me.getMentionStartPattern(),
            endSearch = me.getMentionEndPattern(),
            testStr, pos, parentPos, boundaryIdx, innerIdx;

        // get first, previous instance of '@'
        pos = value.lastIndexOf(triggerSearch, startPosition);
        if (pos > -1) {
            testStr = value.substring(pos, startPosition);
            boundaryIdx = testStr.search(/\s/);
            // if we have spaces, new line characters, or tabs, need to backup
            if (boundaryIdx > -1) {
                innerIdx = pos + boundaryIdx;
                if (startPosition <= innerIdx) {
                    validMatch = true;
                }
            } else {
                validMatch = true;
            }
            // have a technically valid '@' match.
            // now let's see if it's a substring of a '[~]' match
            if (validMatch) {
                parentPos = value.lastIndexOf(startSearch, startPosition);
                testStr = value.substring(parentPos, startPosition);
                boundaryIdx = testStr.search(/\s/);
                // if there are no whitespace characters in string
                // we'll assume that this isn't a child of a '[~]' match
                if (boundaryIdx > -1 || pos === 0) {
                    lookup.position = pos;
                    lookup.type = 'text';
                }
            }
        }
        // we didn't match on '@'...check '[~]'
        if (lookup.position === -1) {
            pos = value.lastIndexOf(startSearch, startPosition);
            if (pos > -1) {
                // start from first match position, find closing ']'
                boundaryIdx = value.indexOf(endSearch, pos);
                // if current position is within a '[~...]'
                if (startPosition > pos && startPosition <= boundaryIdx) {
                    lookup.position = pos;
                    lookup.type = 'value';
                }
            }
        }
        return lookup;
    },
    /**
     * Custom execution if this field is used as an editor
     * @param {Ext.EventObject} e
     */
    completeEdit: function(e) {
        var me = this,
            filter = me.queryFilter;

        this.callParent([e]);
        me.doQueryTask.cancel();
        
        if (filter && me.queryMode === 'local' && me.clearFilterOnBlur) {
            me.getStore().getFilters().remove(filter);
        }
    },
    /**
     * Called when value is selected
     * In this custom implementation, we need to find and replace the query string that gave us this result
     * So instead of just setting the value of the field, we need to slice it up and stitch it back together
     */
    updateValue: function() {
        var me = this,
            field = me,
            selectedRecords = me.valueCollection.getRange(),
            record = selectedRecords[0],
            input = field.inputEl,
            value = field.getValue(),
            lookup = me.getLookupPosition(),
            triggerSearch = me.getMentionTrigger(),
            startSearch = me.getMentionStartPattern(),
            endSearch = me.getMentionEndPattern(),
            replaceRe = new RegExp('^' + me.mentionStartRe + '|' + me.mentionTriggerRe),
            replacer = startSearch + record.get(me.valueField) + endSearch,
            replacement = record.get(me.getDisplayField()),
            compareString = '',
            charOffset = lookup.type === 'text' ? triggerSearch.length : startSearch.length+1,
            openRe = lookup.type === 'text' ? me.mentionTriggerRe : me.mentionStartRe,
            closeRe = lookup.type === 'value' ? me.mentionEndRe : '',
            closeIdx, remainder, cleanedQuery, reRegex, front, back, i;
        
        if (lookup.position > -1) {
            remainder = value.substr(lookup.position);
            cleanedQuery = remainder.replace(replaceRe, '');
            // if the lookup type is by text, go character by character to determine the replacement string
            if (lookup.type === 'text') {
                if (cleanedQuery.length) {
                    for (var i = 0; i < replacement.length; i++) {
                        if (!cleanedQuery[i]) {
                            break;
                        }
                        if (replacement[i].toLowerCase() === cleanedQuery[i].toLowerCase()) {
                            compareString += replacement[i].toLowerCase();
                        } else {
                            break;
                        }
                    }
                }
            }
            // if lookup type is by value, we already know the full replacer string
            else {
                closeIdx = cleanedQuery.indexOf(endSearch);
                compareString = cleanedQuery.substring(0, closeIdx);
            }
            front = value.substr(0, lookup.position);
            back = value.substr(lookup.position + (compareString.length + charOffset));
            reRegex = new RegExp(openRe + compareString + closeRe, 'i');
            value = front + replacer + back;
            field.setRawValue(value);
            field.setCaretPosition(value.indexOf(back));
            me.collapse();
        }
    },
    /**
     * Setup listeners for store
     * @return {Object}
     */
    getStoreListeners: function(store) {
		if (!store.isEmptyStore) {
            var me = this,
                result = {
                    datachanged: me.onDataChanged,
                    exception: me.onException
                };

            return result;
        }
    },
    /**
     * Performs extra setup post-field rendering
     *
	 */
    afterRender: function(){
        var me = this;
        me.callParent(arguments);
        me.onFieldRender();
    },
    /**
     * Once query is executed, process extra logic
     * @param {Object} queryPlan
     */
    afterQuery: function(queryPlan) {
        var me = this;
        me.expand();
        if (me.store.getCount()) {
            if (queryPlan.rawQuery) {
                if (me.picker && !me.picker.getSelectionModel().hasSelection()) {
                    me.doAutoSelect();
                }
            } else {
                me.doAutoSelect();
            }
        }
    },
    /**
     * Handler for delayed query task
     */
    doRawQuery: function() {
        var me = this,
            rawValue = me.getQuery().value;
		// run query
        me.doQuery(rawValue, true, true);
    },
    /**
     * Handler for field blur
     * @param {Ext.form.field.Jira} field The field that was blurred
     * @param {Ext.EventObject} e
     * @param {Object} eOpts
     */
    onFieldBlur: function(field, e, eOpts) {
        this.collapse();
    },
    /**
     * Handler for field render
     * @param {Ext.form.field.Jira} field The field that was blurred
     */
    onFieldRender: function() {
        var me = this;
        // if key events not enabled, add keyup listener
        if (!me.enableKeyEvents) {
            me.mon(me.inputEl, {
                scope: me,
                keyup: me.onKeyUp,
                keydown: me.onKeyDown,
                mouseup: me.onMouseUp
            });
        }
    },
    /**
     * Handler for key down
     * @param {Ext.EventObject} e
     * @param {Ext.Element} target
     */
    onKeyDown: function(e, target) {
        var me = this,
            lookup = me.getLookupPosition();
        
        if (lookup.position > -1) {
            if (e.keyCode === 38 || e.keyCode === 40) {
                e.preventDefault();
            }        
        }
    },
    /**
     * Handler for key up
     * @param {Ext.EventObject} e
     * @param {Ext.Element} target
     */
    onKeyUp: function(e, target) {
        var me = this,
            lookup = me.getLookupPosition();
        if (lookup.position > -1) {
            if (!Ext.Array.contains(me.ignoreKeys, e.keyCode)) {
                me.currentMatchOriginPos = lookup.position;
                // first, only if character is the match symbol OR is part of a match string
                me.doQueryTask.delay(me.queryDelay);
            } else {
                e.preventDefault();
                // esc
                if (e.keyCode === 27) {
                    me.onEsc();
                }                
            }
        } else {
            if (!me.getPicker().isHidden()) {
                me.collapse();
            }
        }
    },
    /**
     * Handler for mouse up
     * @param {Ext.EventObject} e
     * @param {Ext.Element} target
     */
    onMouseUp: function(e, target) {
        var me = this,
            lookup = me.getLookupPosition();
        if (lookup.position > -1) {
            me.currentMatchOriginPos = lookup.position;
            me.doQueryTask.delay(me.queryDelay);
            //me.doQuery(me.getQuery().value, true, true);
        } else {
            if (!me.getPicker().isHidden()) {
                me.collapse();
            }
        }

    },
    /**
     * Handler for ESC
     * @param {Ext.EventObject} e
     * @param {Ext.Element} target
     */
    onEsc: function() {
        this.collapse();
    },
    /**
     * Run cleanup on this field when destroyed
     */
    onDestroy: function() {
        var me = this;
        me.doQueryTask.cancel();
        me.bindStore(null);
        me.valueCollection = Ext.destroy(me.valueCollection);
        me.callParent();
    }
}, function() {
    /** 
    	For this custom field, we want the built-in goodness of a picker, but not all the default 
        stuff that extending a combobox would bring. So instead of extending combobox, we'll 
        just extend Ext.form.field.TextArea and burgle the methods/props that we need from
        Ext.form.field.ComboBox. Fortunately, the "selection" aspect of combobox is pretty well segregated
        from the "value" management, so it works surprisingly well!
    */
    // burgle picker methods
    this.borrow(Ext.form.field.Picker, ['expand', 'collapse', 'alignPicker', 'doAlign', 'onFocusLeave', 'beforeDestroy', 'getRefItems', 'collapseIf']);
    // burgle combobox methods
    this.borrow(Ext.form.field.ComboBox, ['doAutoSelect', 'createPicker', 'getPickerStore', 'onBeforePickerShow', 'onBeforeSelect', 'onBeforeDeselect', 'onFocusChange', 'onPageChange', 'loadPage', 'onDataChanged', 'onException', 'onBindStore', 'onUnbindStore', 'onValueCollectionBeginUpdate', 'onValueCollectionEndUpdate', 'updateBindSelection', 'isSelectionUpdating', 'resetToDefault', 'getParams', 'getPickerStore', 'getPicker', 'doLocalQuery', 'doRemoteQuery', 'doQuery', 'beforeQuery', 'onCollapse', 'onExpand']);
    // burgle combobox properties
    this.borrow(Ext.form.field.ComboBox, ['autoSelect', 'selectOnTab', 'pickerAlign', 'matchFieldWidth', 'openCls', 'isExpanded', 'allQuery', 'queryParam', 'queryMode', 'queryCaching', 'pageSize', 'anyMatch', 'caseSensitive', 'clearFilterOnBlur', 'defaultListConfig']);
});