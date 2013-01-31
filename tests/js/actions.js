(function($) {

    module("actions1");

    // test case: actions
    test("Actions #1", function() {

        stop();

        var actions = Ratchet.Actions;

        actions.execute("test", {
            "booya": "shakka"
        }, function() {
            equal(Ratchet.___test.booya, "shakka", "Test action fired properly");
        });

        // all done
        start();
    });

}(jQuery) );