Ext.define('MentionExample.view.example.Editor', {
    extend: 'Ext.form.Panel',
    xtype: 'example-editor',
    title: 'Editor',
    viewModel: {
        stores: {
            people: {
                type: 'people',
                autoLoad: true,
                sorters: [{
                    property: 'name',
                    direction: 'ASC'
                }]
            },
            tasks: {
                fields: ['title', 'description'],
                data: [{
                    title: 'Take out trash',
                    description: 'Hey [~brooke.berry@example.com], can you do this?'
                },{
                    title: 'Wash the car',
                    description: 'Hey [~ella.wheeler@example.com], can you do this?'
                },{
                    title: 'Find apartment',
                    description: 'Hey [~katie.mason@example.com], can you do this?'
                }],
                sorters: [{
                    property: 'name',
                    direction: 'ASC'
                }]
            }
        }
    },
    items: [{
        xtype: 'component',
        margin: '0 0 20 0',
        html: [
            'This field is a custom "Comments" fields that has support for "mentioning" users.<br /><br />',
            'You can bind a store to this textfield, and use the "@" to trigger a lookup of the store. ',
            'This will  display a picker from which you can choose a matching value. Selecting a value will replace the search ',
            'text with a special syntax "[~some_selected_value]", that can be used for other purposes in other intefaces.<br /><br />',
            'As with Ext.form.field.ComboBox, this custom field can be configured with remote or local querying, ',
            'and even paging of the results.'                    
        ].join('')                
    },{
        xtype: 'grid',
        bind: '{tasks}',
        plugins: 'rowediting',
        columns: [{
            text: 'Task',
            dataIndex: 'title',
            editor: 'textfield'
        },{
            text: 'Description',
            dataIndex: 'description',
            flex: 1,
            editor: {
                xtype: 'mention-field',
                bind: {
                    store: '{people}'
                },
                listConfig: {
                    maxHeight: 130,
                    emptyText: '<div style="padding:3px 10px;">Sorry, no matches were found</div>'
                },
                displayField: 'name',
                valueField: 'email',
                queryMode: 'local'
            }
        }]
    }]
});
