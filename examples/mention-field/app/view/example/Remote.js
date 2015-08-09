Ext.define('MentionExample.view.example.Remote', {
    extend: 'Ext.form.Panel',
    xtype: 'example-remote',
    title: 'Remote',
    viewModel: {
        stores: {
            people: {
                type: 'people',
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
            '<h1>Remote Querying</h1>',
            'This example is identical to Simple Querying, but shows how you can use this with remote filtering via queryModel:remote. ',
            'Also, just like with Ext.form.field.ComboBox, you can configure the results to use paging.'
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
        queryMode: 'remote',
        pageSize: 25
    }]
});