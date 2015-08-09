Ext.define('MentionExample.view.example.Thumbnail', {
    extend: 'Ext.form.Panel',
    xtype: 'example-thumbnail',
    title: 'Thumbnails',
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
            '<h1>Thumbnail Support</h1>',
            'Although you could use this with *any* data, the primary use case for the Mention field is with a person list. ',
            'So it has been configured to support thumbnails in the search list. All you have to do is add a few configs:',
            '<ul>',
                '<li><strong>includeImage:</strong> Set to *true* to enable the tpl to be updated to include a thumbnail</li>',
                '<li><strong>imageField:</strong> The field in your store\'s results where the thumbnail path exists</li>',
                '<li><strong>defaultImage:</strong> Path to an image to use when no image is found in the data</li>',
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
        defaultImage: 'resources/images/user.png'
    }]
});
