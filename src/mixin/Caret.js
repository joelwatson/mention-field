Ext.define('Mention.mixin.Caret', {
    /**
     * Thanks to Mitchell Simoens (https://github.com/mitchellsimoens) for 
     * creating and sharing these utilities!
     */
    extend: 'Ext.Mixin',
    /**
     * Get the caret position as an object of start and end values.
     *
     * @return {{start: number, end: number}}
     */
    getCaretPosition: function () {
        var el = this.inputEl.dom,
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
    },
    /**
     * Set the caret position in the {@link Sencha.view.abstracts.field.TextArea}.
     *
     * @param {Number} start The start position of the caret.
     * @param {Number} end The end position of the caret for selection purposes.
     * If left out, will default to the start value.
     * @return {Mention.Field}
     */
    setCaretPosition : function (start, end) {
        var el = this.inputEl.dom,
            range;

        end = end || start;

        if (el.dom) {
            el = el.dom;
        }

        if (el.setSelectionRange) {
            el.setSelectionRange(start, end);
            el.focus();
        } else if (el.createTextRange) {
            range = el.createTextRange();

            range.collapse(true);
            range.moveEnd('character', start);
            range.moveStart('character', end);
            range.select();
        }

        return this;
    }
});
