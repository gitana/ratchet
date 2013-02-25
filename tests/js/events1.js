(function($) {

    module("events1");

    // test case: events 1
    test("Events #1", function() {

        stop();


        // global scope
        // trigger 3 times, incrementing + 1 each time = 3
        var a1 = 0;
        var f1 = function(params) {
            a1 = a1 + params.amount;
        };
        Ratchet.Events.on("t1", f1);
        Ratchet.Events.trigger("t1", { amount: 1 });
        Ratchet.Events.trigger("t1", { amount: 1 });
        Ratchet.Events.trigger("t1", { amount: 1 });
        equal(a1, 3, "A1 was 3");


        // global scope
        // trigger 3 times, with two handlers, check both fire, sum = 0
        var a2 = 0;
        var f21 = function(params) {
            a2 = a2 + params.amount;
        };
        var f22 = function(params) {
            a2 = a2 - params.amount;
        };
        Ratchet.Events.on("t2", f21);
        Ratchet.Events.on("t2", f22);
        Ratchet.Events.trigger("t1", { amount: 100 });
        Ratchet.Events.trigger("t1", { amount: 100 });
        Ratchet.Events.trigger("t1", { amount: 100 });
        equal(a2, 0, "A2 was 0");


        // two scopes, check they operate independently
        var a31 = 0;
        var a32 = 0;
        var f31 = function(params) {
            a31 = a31 + params.amount;
        };
        var f32 = function(params) {
            a32 = a32 + params.amount;
        };
        Ratchet.Events.on("s31", "t3", f31);
        Ratchet.Events.on("s32", "t3", f32);
        Ratchet.Events.trigger("t3", { amount: 1000 }); // should have no impact
        Ratchet.Events.trigger("s31", "t3", { amount: 100 });
        Ratchet.Events.trigger("s32", "t3", { amount: 10 });
        equal(a31, 100, "a31 was 100");
        equal(a32, 10, "a32 was 10");


        // global scope, add and remove subscriber, verify works
        var a4 = 0;
        var f4 = function(params) {
            a4 = a4 + params.amount;
        };
        Ratchet.Events.on("t4", f4);
        Ratchet.Events.trigger("t4", { amount: 1 });
        Ratchet.Events.trigger("t4", { amount: 1 });
        Ratchet.Events.trigger("t4", { amount: 1 });
        equal(a4, 3, "a4 is 3");
        // now unsubscribe and trigger
        Ratchet.Events.off("t4", f4);
        Ratchet.Events.trigger("t4", { amount: 1 });
        Ratchet.Events.trigger("t4", { amount: 1 });
        Ratchet.Events.trigger("t4", { amount: 1 });
        equal(a4, 3, "a4 was still 3");


        // all done
        start();
    });

}(jQuery) );