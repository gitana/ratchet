(function($) {

    module("config1");

    // test case: configuration service
    test("Configuration Service #1", function() {

        stop();

        var config = Ratchet.Configuration;


        // ensure that we can retrieve a non-evaluated configuration
        config.add({
            "config": {
                "title": "Hello World",
                "body": {
                    "message": "First Message"
                },
                "array": [1, 2, 3]
            }
        });
        var json = config.evaluate(null);
        equal(json.title, "Hello World", "Retrieved Hello World");
        equal(json.body.message, "First Message", "Retrieved First Message");
        equal(json.array.length, 3, "Retrieved array length 3");


        // now merge something and ensure deep merge works
        config.add({
            "config": {
                "body": {
                    "message": "Second Message"
                },
                "array": [4]
            }
        });
        json = config.evaluate(null);
        equal(json.title, "Hello World", "Retrieved Hello World");
        equal(json.body.message, "Second Message", "Retrieved Second Message");
        equal(json.array.length, 4, "Retrieved array length 4");


        // test out the "type" evaluator
        config.add({
            "evaluator": "type",
            "condition": "folder",
            "config": {
                "title": "Wintermute",
                "array": [5, 6]
            }
        });
        json = config.evaluate({"type": "folder"});
        equal(json.title, "Wintermute", "Retrieved Wintermute");
        equal(json.body.message, "Second Message", "Retrieved Second Message");
        equal(json.array.length, 6, "Retrieved array length 6");
        json = config.evaluate(null);
        equal(json.title, "Hello World", "Retrieved Hello World");
        equal(json.body.message, "Second Message", "Retrieved Second Message");
        equal(json.array.length, 4, "Retrieved array length 4");


        // test out "replace" for type "file"
        config.add({
            "evaluator": "type",
            "condition": "file",
            "replace": true,
            "config": {
                "array": [9]
            }
        });
        json = config.evaluate({"type": "file"});
        equal(json.title, "Hello World", "Retrieved Hello World");
        equal(json.body.message, "Second Message", "Retrieved Second Message");
        equal(json.array.length, 1, "Retrieved array length 1");


        // all done
        start();
    });

}(jQuery) );