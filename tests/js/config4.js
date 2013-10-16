(function($) {

    module("config4");

    // test case: configuration service
    test("Configuration Service #4", function() {

        stop();

        Ratchet.Configuration.add({
            "evaluator": "or",
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

        // this should work
        var json1 = Ratchet.Configuration.evaluate({
            "page": "abc"
        });
        ok(json1.albumTitle == "Achtung Baby", "First pass AND worked");

        // this should work
        var json2 = Ratchet.Configuration.evaluate({
            "locale": "en"
        });
        ok(json2.albumTitle == "Achtung Baby", "Second pass AND worked");

        // this should not work
        var json3 = Ratchet.Configuration.evaluate({
            "page": "def",
            "locale": "es"
        });
        ok(!json3.albumTitle, "Third Pass did not pass");

        // all done
        start();
    });

}(jQuery) );