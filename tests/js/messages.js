(function($) {

    module("messages1");

    // test case: messages
    test("Messages #1", function() {

        stop();

        var messages = Ratchet.Messages;

        // check defaults
        var locale = Ratchet.Messages.DEFAULT_LOCALE;
        var bundle = messages.using(locale);
        equal(bundle.message("date-format.default"), "ddd mmm dd yyyy HH:MM:ss");
        equal(bundle.message("relative.minutes"), "{0} minutes ago");
        // token substitution
        equal(bundle.message("relative.minutes", [42]), "42 minutes ago");

        // now try to get a locale that isn't in the config
        // should fall back to DEFAULT_LOCALE
        bundle = messages.using("ES_es");
        equal(bundle.message("relative.minutes"), "{0} minutes ago");

        // add a makeshift spanish/spain
        // ensure that we grab spanish/spain translation
        Ratchet.Configuration.add({
            "evaluator": "locale",
            "condition": "es_ES",
            "config": {
                "messages": {
                    "relative": {
                        "minutes": "{0} minutos atras"
                    }
                }
            }
        });
        bundle = messages.using("es_ES");
        ok(Ratchet.isUndefined(bundle.message("date-format.default")));
        equal(bundle.message("relative.minutes"), "{0} minutos atras");

        // add a german DE translation
        // ensure that language fallback works
        Ratchet.Configuration.add({
            "evaluator": "locale",
            "condition": "de",
            "config": {
                "messages": {
                    "relative": {
                        "minutes": "SOMETHING IN GERMAN"
                    }
                }
            }
        });
        bundle = messages.using("de_DE");
        ok(Ratchet.isUndefined(bundle.message("date-format.default")));
        equal(bundle.message("relative.minutes"), "SOMETHING IN GERMAN");


        // DATE FORMATTING
        bundle = messages.using(Ratchet.Messages.DEFAULT_LOCALE);
        var date = Date.parse('July 8th, 2007, 10:30 PM');
        var shortTime = bundle.dateFormat(date, "shortTime");
        equal(shortTime, "10:30 PM");
        var shortDate = bundle.dateFormat(date, "shortDate");
        equal(shortDate, "7/8/07");

        // add in a european conventions
        Ratchet.Configuration.add({
            "evaluator": "locale",
            "condition": "en_UK",
            "config": {
                "messages": {
                    "date-format": {
                        "shortTime": "h:MM tt",
                        "shortDate": "d/m/yy"
                    }
                }
            }
        });
        bundle = messages.using("en_UK");
        date = Date.parse('July 8th, 2007, 10:30 PM');
        shortTime = bundle.dateFormat(date, "shortTime");
        equal(shortTime, "10:30 pm");
        shortDate = bundle.dateFormat(date, "shortDate");
        equal(shortDate, "8/7/07");


        // RELATIVE TIMES AND DATES
        bundle = messages.using(Ratchet.Messages.DEFAULT_LOCALE);
        var minutesAgo = new Date().add(-3).minutes();
        equal(bundle.relativeTime(minutesAgo), "3 minutes ago");
        var yesterday = new Date().add(-1).days();
        equal(bundle.relativeDate(yesterday), "yesterday");
        var nextWeek = new Date().add(8).days();
        debugger;
        equal(bundle.relativeDate(nextWeek), "next week");





        // all done
        start();
    });

}(jQuery) );