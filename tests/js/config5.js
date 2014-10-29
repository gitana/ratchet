(function($) {

    // tests out larger scale config operation

    module("config5");

    // test case: configuration service
    test("Configuration Service #5", function() {

        stop();

        console.log("Running test...");

        var iterations = 1;
        var sample_set_size = 1000;

        // populate sample set
        for (var i = 0; i < sample_set_size; i++)
        {
            Ratchet.Configuration.add({
                "evaluator": "page",
                "condition": "abc" + i,
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
                "page": "abc10"
            });
        }
        var t2 = new Date().getTime();
        var average = (t2 - t1) / iterations;

        console.log("Average: " + average + " ms per lookup");

        ok(true, "Test passed");
        start();

    });

}(jQuery) );