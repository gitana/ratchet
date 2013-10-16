(function($) {

    module("config3");

    // test case: configuration service
    test("Configuration Service #3", function() {

        stop();

        Ratchet.Configuration.add({
            "evaluator": "and",
            "condition": [{
                "evaluator": "page",
                "condition": "abc"
            }, {
                "evaluator": "locale",
                "condition": "en"
            }],
            "config": {
                "albumTitle": "Achtung Baby"
            }
        });

        var json1 = Ratchet.Configuration.evaluate({
            "page": "abc",
            "locale": "en"
        });
        ok(json1.albumTitle == "Achtung Baby", "First pass AND worked");

        // now try again
        var json2 = Ratchet.Configuration.evaluate({
            "page": "def",
            "locale": "es"
        });
        ok(!json2.albumTitle, "Second Pass did not pass");

        // all done
        start();
    });

}(jQuery) );