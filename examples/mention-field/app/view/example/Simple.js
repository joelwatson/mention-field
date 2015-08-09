Ext.define('MentionExample.view.example.Simple', {
    extend: 'Ext.form.Panel',
    xtype: 'example-simple',
    title: 'Simple',
    viewModel: {
        stores: {
            people: {
                type: 'people',
                autoLoad: true,
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
            '<h1>Simple Querying</h1>',
            'This example demonstrates using a Mention field with a simple store and local querying.<br /><br />',
            '<strong>Use "@" to start your search</strong>'
        ].join('')                
    },{
        xtype: 'mention-field',
        height: 200,
        anchor: '100%',
        name: 'comments',
        fieldLabel: 'Comments',
        labelAlign: 'top',
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
    }]
});
