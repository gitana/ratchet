(function($) {

    module("actions1");

    // test case: actions
    test("Actions #1", function() {

        stop();

        var actions = Ratchet.Actions;

        actions.execute("test", null, {
            "booya": "shakka"
        }, function(err, data) {

            equal(Ratchet.___test.booya, "shakka", "Test action fired properly");
            ok(!Ratchet.isEmpty(err));
            equal(err.message, "hello", "Error message came back properly");
            equal(data.success, true, "Success was true");
        });

        // all done
        start();
    });

}(jQuery) );