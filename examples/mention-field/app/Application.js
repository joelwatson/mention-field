/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('MentionExample.Application', {
    extend: 'Ext.app.Application',
    
    name: 'MentionExample',

    stores: [
        // TODO: add global / shared stores here
    ],
    
    launch: function () {
        var data = [{
            "name": "Ortiz Mcmahon",
            "email": "ortizmcmahon@voipa.com"
        }, {
            "name": "Lavonne Mendez",
            "email": "lavonnemendez@voipa.com"
        }, {
            "name": "Kim Lawrence",
            "email": "kimlawrence@voipa.com"
        }, {
            "name": "Meadows Haley",
            "email": "meadowshaley@voipa.com"
        }, {
            "name": "Georgina Bender",
            "email": "georginabender@voipa.com"
        }, {
            "name": "Klein Blanchard",
            "email": "kleinblanchard@voipa.com"
        }, {
            "name": "Alexandria Mcintyre",
            "email": "alexandriamcintyre@voipa.com"
        }, {
            "name": "Molina Everett",
            "email": "molinaeverett@voipa.com"
        }, {
            "name": "Harrison Justice",
            "email": "harrisonjustice@voipa.com"
        }, {
            "name": "Gonzales Sanders",
            "email": "gonzalessanders@voipa.com"
        }, {
            "name": "Audra Cook",
            "email": "audracook@voipa.com"
        }, {
            "name": "Luna Mills",
            "email": "lunamills@voipa.com"
        }, {
            "name": "Megan Barnes",
            "email": "meganbarnes@voipa.com"
        }, {
            "name": "Irene Morrison",
            "email": "irenemorrison@voipa.com"
        }, {
            "name": "Mclean Donaldson",
            "email": "mcleandonaldson@voipa.com"
        }, {
            "name": "Jennings Harrington",
            "email": "jenningsharrington@voipa.com"
        }, {
            "name": "Jodi Keller",
            "email": "jodikeller@voipa.com"
        }, {
            "name": "Valenzuela Dorsey",
            "email": "valenzueladorsey@voipa.com"
        }, {
            "name": "Drake Murray",
            "email": "drakemurray@voipa.com"
        }, {
            "name": "Sharon Francis",
            "email": "sharonfrancis@voipa.com"
        }, {
            "name": "Alana Steele",
            "email": "alanasteele@voipa.com"
        }, {
            "name": "Savannah Blankenship",
            "email": "savannahblankenship@voipa.com"
        }, {
            "name": "Katheryn Newton",
            "email": "katherynnewton@voipa.com"
        }, {
            "name": "Evans Walker",
            "email": "evanswalker@voipa.com"
        }, {
            "name": "Kristen Daugherty",
            "email": "kristendaugherty@voipa.com"
        }, {
            "name": "Larson Coleman",
            "email": "larsoncoleman@voipa.com"
        }, {
            "name": "Martinez Ellis",
            "email": "martinezellis@voipa.com"
        }, {
            "name": "Latoya Williams",
            "email": "latoyawilliams@voipa.com"
        }, {
            "name": "Marci Montgomery",
            "email": "marcimontgomery@voipa.com"
        }, {
            "name": "Lucy Vazquez",
            "email": "lucyvazquez@voipa.com"
        }, {
            "name": "Lindsey Cherry",
            "email": "lindseycherry@voipa.com"
        }, {
            "name": "Patrick Higgins",
            "email": "patrickhiggins@voipa.com"
        }, {
            "name": "Kayla Flowers",
            "email": "kaylaflowers@voipa.com"
        }, {
            "name": "Goff Banks",
            "email": "goffbanks@voipa.com"
        }, {
            "name": "Ines Jordan",
            "email": "inesjordan@voipa.com"
        }, {
            "name": "Aimee Holmes",
            "email": "aimeeholmes@voipa.com"
        }, {
            "name": "Cynthia King",
            "email": "cynthiaking@voipa.com"
        }, {
            "name": "Hall Ortega",
            "email": "hallortega@voipa.com"
        }, {
            "name": "Peterson May",
            "email": "petersonmay@voipa.com"
        }, {
            "name": "Robbins Kent",
            "email": "robbinskent@voipa.com"
        }, {
            "name": "Latisha Pugh",
            "email": "latishapugh@voipa.com"
        }, {
            "name": "Henrietta Hebert",
            "email": "henriettahebert@voipa.com"
        }, {
            "name": "Singleton Cervantes",
            "email": "singletoncervantes@voipa.com"
        }, {
            "name": "Finley Livingston",
            "email": "finleylivingston@voipa.com"
        }, {
            "name": "Kelli Santana",
            "email": "kellisantana@voipa.com"
        }, {
            "name": "Herminia Little",
            "email": "herminialittle@voipa.com"
        }, {
            "name": "Jordan Kerr",
            "email": "jordankerr@voipa.com"
        }, {
            "name": "Wendy Mathews",
            "email": "wendymathews@voipa.com"
        }, {
            "name": "Caitlin Hampton",
            "email": "caitlinhampton@voipa.com"
        }, {
            "name": "Carolyn Horn",
            "email": "carolynhorn@voipa.com"
        }];

        Ext.ux.ajax.SimManager.init({delay:100}).register({
            '/user': {
                type: 'json',
                data: function(simlet, ctx) {
                    var me = this,
                        params = simlet.params,
                        q = params.query,
                        matches = [],
                        matchRe = new RegExp('^'+q, 'i'),
                        start = params.start,
                        end = (params.page*25)-1,
                        item, i;

                    for(i=0; i<data.length; i++) {
                        item = data[i];
                        if(q) {
                            if(matchRe.test(item.name) || matchRe.test(item.email)) {
                                matches.push(item)
                            }
                        }
                        else {
                            matches.push(item);
                        }
                    }
                    return matches;
                }
            }
        });
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
