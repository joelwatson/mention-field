Ext.define('MentionExample.store.People', {
    extend: 'Ext.data.Store',
    alias: 'store.people',
    requires: ['MentionExample.model.Person'],
    model: 'MentionExample.model.Person',
    proxy: {
        type: 'ajax',
        url: '/user',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});
