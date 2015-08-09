Ext.define('MentionExample.view.example.Custom', {
    extend: 'Ext.form.Panel',
    xtype: 'example-custom',
    title: 'Custom',
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
            '<h1>Customizing Triggers</h1>',
            'By default, the "@" is the trigger to start a lookup for a value, and the resulting selection will be wrapped in ',
            '[~{valueField}]. If needed, you can adjust this to suit your own formats with the following configs:',
            '<ul>',
                '<li><strong>mentionTrigger:</strong> The character to match on to initiate a lookup (e.g. "@" or "+")</li>',
                '<li><strong>mentionStartPattern:</strong> The opening part of the pattern to use for setting the raw value of the selection which will identify the beginning of a "mention" section</li>',
                '<li><strong>mentionEndPattern:</strong> The closing part of the pattern to use for setting the raw value of the selection which will identify the ending of a "mention" section</li>',
            '</ul>'
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
        queryMode: 'local',
        imageField: 'thumbnail',
        includeImage: true,
        defaultImage: 'resources/images/user.png',
        mentionTrigger: '+',
        mentionStartPattern: '{___',
        mentionEndPattern: '}'
    }]
});
