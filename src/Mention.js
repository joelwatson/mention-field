Ext.define('Mention.Field', {
    extend: 'Ext.form.field.TextArea',
    alias: 'widget.mention-field',
    mixins: ['Ext.util.StoreHolder'],
    config: {
        displayField: 'text',
        displayTpl: false,
        selection: null
    },
    ignoreKeys: [38, 40, 13, 27, 9],
    patternRe: '\[~|@',
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
        me.callParent();
        // setup query task
        me.doQueryTask = new Ext.util.DelayedTask(me.doRawQuery, me);
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
            substring = value.substr(lookup.position, queryEnd);
            //queryEnd = type === 'text' ? startPosition - lookup.position : value.indexOf(']', lookup.position),
            //substring = type === 'text' ? value.substr(lookup.position, queryEnd) : value.substring(lookup.position, queryEnd);
        
        return {
            property: type === 'text' ? me.getDisplayField() : me.valueField,
            value: substring.replace(/^\[~|@/, '')
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
            bracketRe = /\[~\S+\]/g,
            lookup = {
                position: -1,
                mode: null
            },
            validMatch = false,
            testStr, pos, parentPos, boundaryIdx, innerIdx;

        // get first, previous instance of '@'
        pos = value.lastIndexOf('@', startPosition);
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
                parentPos = value.lastIndexOf('[~', startPosition);
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
            pos = value.lastIndexOf('[~', startPosition);
            if (pos > -1) {
                // start from first match position, find closing ']'
                boundaryIdx = value.indexOf(']', pos);
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
            replacer = '[~' + record.get(me.valueField) + ']',
            replacement = record.get(me.getDisplayField()),
            compareString = '',
            charOffset = lookup.type === 'text' ? 1 : 3,
            openRe = lookup.type === 'text' ? '@' : '[~',
            closeRe = lookup.type === 'value' ? ']' : '',
            closeIdx,
            remainder,
            cleanedQuery,
            reRegex,
            front, back, i;
        
        if (lookup.position > -1) {
            remainder = value.substr(lookup.position);
            cleanedQuery = remainder.replace(/^\[~|@/, '');
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
                closeIdx = cleanedQuery.indexOf(']');
                compareString = cleanedQuery.substring(0, closeIdx);
            }
            front = value.substr(0, lookup.position);
            back = value.substr(lookup.position + (compareString.length + charOffset));
            reRegex = new RegExp(openRe + compareString + closeRe, 'i');
            value = front + replacer + back;
            field.setRawValue(value);
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
        if (e.keyCode === 9) {
            me.onTab(e, target);
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
                //me.doQuery(me.getQuery().value, true, true);
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
    onTab: function(e, target) {
        var me = this;
        console.log(me.inSearchMode)
      	 console.log('what')
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
    },
    getCaretPosition: function(field) {
        var el = (field || this).inputEl.dom,
            start = 0,
            end = 0,
            normalizedValue, range,
            textInputRange, len, endRange;

        if (typeof el.selectionStart == 'number' && typeof el.selectionEnd == 'number') {
            //modern
            start = el.selectionStart;
            end = el.selectionEnd;
        } else if (document.selection) {
            //IE
            range = document.selection.createRange();

            if (range && range.parentElement() == el) {
                len = el.value.length;
                normalizedValue = el.value.replace(/\r\n/g, '\n');

                // Create a working TextRange that lives only in the input
                textInputRange = el.createTextRange();
                textInputRange.moveToBookmark(range.getBookmark());

                // Check if the start and end of the selection are at the very end
                // of the input, since moveStart/moveEnd doesn't return what we want
                // in those cases
                endRange = el.createTextRange();
                endRange.collapse(false);

                if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                    start = end = len;
                } else {
                    start = -textInputRange.moveStart('character', - len);
                    start += normalizedValue.slice(0, start).split('\n').length - 1;

                    if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
                        end = len;
                    } else {
                        end = -textInputRange.moveEnd('character', - len);
                        end += normalizedValue.slice(0, end).split('\n').length - 1;
                    }
                }
            }
        }

        return {
            start: start,
            end: end
        };
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