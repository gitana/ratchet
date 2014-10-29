(function($) {

    // tests large sample set with AND

    module("config6");

    // test case: configuration service
    test("Configuration Service #6", function() {

        stop();

        console.log("Running test...");

        var iterations = 1;
        var sample_set_size = 1000;

        // populate sample set
        for (var i = 0; i < sample_set_size; i++)
        {
            Ratchet.Configuration.add({
                "evaluator": "and",
                "condition": [{
                    "evaluator": "page",
                    "condition": "abc" + i
                }, {
                    "evaluator": "locale",
                    "condition": "en"
                }],
                "config": {
                    "albumTitle": "Hail to the Thief",
                    "band": "radiohead",
                    "reviewers": ["joe"]
                }
            });
        }

        // lookups
        var t1 = new Date().getTime();
        for (var i = 0; i < iterations; i++)
        {
            Ratchet.Configuration.evaluate({
                "page": "abc10",
                "locale": "en"
            });
        }
        var t2 = new Date().getTime();
        var average = (t2-t1) / iterations;

        console.log("Average: " + average + " ms per lookup");

        ok(true, "Test passed");
        start();

    });

}(jQuery) );