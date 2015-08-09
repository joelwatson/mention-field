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
        'MentionExample.store.People'
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
        xtype: 'form',
        iconCls: 'fa-home',
        title: '"Mention" Textarea',
        bodyPadding: 10,
        tbar: [{
            text: 'Get Values',
            handler: function(btn, e, eOpts) {
                var form = btn.up('form');
                Ext.Msg.alert('Form Values', JSON.stringify(form.getValues()))
            }
        }],
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
    }]
});
