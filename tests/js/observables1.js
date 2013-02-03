(function($) {

    module("observables1");

    // test case: observables
    test("Observables #1", function() {

        stop();

        var observable = Ratchet.observable;
        var subscribe = Ratchet.subscribe;
        var unsubscribe = Ratchet.unsubscribe;
        var clearObservable = Ratchet.clearObservable;

        observable("v1").set("redsox");
        observable("v2").set("brewers");

        // check values
        equal(observable("v1").get(), "redsox");
        equal(observable("v2").get(), "brewers");

        // alternative scope ("test")
        observable("test", "v1").set("indians");
        equal(observable("test", "v1").get(), "indians");
        equal(observable("v1").get(), "redsox");

        // add a listener
        var x = 0;
        var listener1 = function(newValue, oldValue)
        {
            if (x == 0)
            {
                equal(newValue, "BREWERS");
                equal(oldValue, "brewers");
            }
            x++;
        };
        subscribe("v2", listener1);

        // change "brewers" to "BREWERS" and verify listener works
        observable("v2").set("BREWERS");
        equal(x, 1, "Listener fired");

        // unsubscribe the listener
        unsubscribe("v2", listener1);

        // change back to "brewers" and verify listener does not fire
        observable("v2").set("brewers");
        equal(x, 1, "Listener did not fire");

        // all done
        start();
    });

}(jQuery) );