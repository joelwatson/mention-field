/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('MentionExample.view.main.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'app-main',
    requires: [
        'Mention.Field',
        'MentionExample.store.People',
        'MentionExample.view.example.Simple',
        'MentionExample.view.example.Remote',
        'MentionExample.view.example.Thumbnail',
        'MentionExample.view.example.Editor',
        'MentionExample.view.example.Custom'
    ],
    ui: 'navigation',
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
    tabBarHeaderPosition: 1,
    titleRotation: 0,
    tabRotation: 0,
    header: {
        layout: {
            align: 'stretchmax'
        },
        title: {
            bind: {
                text: '{name}'
            },
            flex: 0
        },
        iconCls: 'fa-th-list'
    },
    tabBar: {
        flex: 1,
        layout: {
            align: 'stretch',
            overflowHandler: 'none'
        }
    },
    responsiveConfig: {
        tall: {
            headerPosition: 'top'
        },
        wide: {
            headerPosition: 'left'
        }
    },
    defaults: {
        bodyPadding: 20,
        tabConfig: {
            plugins: 'responsive',
            responsiveConfig: {
                wide: {
                    iconAlign: 'left',
                    textAlign: 'left'
                },
                tall: {
                    iconAlign: 'top',
                    textAlign: 'center',
                    width: 120
                }
            }
        }
    },

    items: [{
        iconCls: 'fa-home',
        title: '"Mention" Textarea',
        html: [
            'This field is a custom "Comments" fields that has support for "mentioning" users.<br /><br />',
            'You can bind a store to this textfield, and use the "@" to trigger a lookup of the store. ',
            'This will  display a picker from which you can choose a matching value. Selecting a value will replace the search ',
            'text with a special syntax "[~some_selected_value]", that can be used for other purposes in other intefaces.<br /><br />',
            'As with Ext.form.field.ComboBox, this custom field can be configured with remote or local querying, ',
            'and even paging of the results.<br /><br />Try out the examples and enjoy! ;)'                    
        ].join('')
    },{
        xtype: 'example-simple',
        iconCls: 'fa-home'
    },{
        xtype: 'example-remote',
        iconCls: 'fa-home'
    },{
        xtype: 'example-thumbnail',
        iconCls: 'fa-home'
    },{
        xtype: 'example-editor',
        iconCls: 'fa-home'
    },{
        xtype: 'example-custom',
        iconCls: 'fa-home'
    }]
});
