(function($) {

    module("config2");

    // test case: configuration service
    test("Configuration Service #2", function() {

        stop();

        var config = Ratchet.Configuration;

        // test generate binding key
        var c = {
            "name": "caribou",
            "properties": {
                "p1": "v1",
                "p3": [1,2,3],
                "p4": {
                    "p5": "v5",
                    "p6": "v6"
                },
                "p2": 3
            }
        };
        var k1 = Ratchet.Configuration.generateBindingKey("a", "b", c);
        equal(k1, "a&b&name=caribou&properties.p1=v1&properties.p2=3&properties.p3.0=1&properties.p3.1=2&properties.p3.2=3&properties.p4.p5=v5&properties.p4.p6=v6", "Binding key generation passed");


        // register actions globally
        Ratchet.Configuration.add({
            "config": {
                "actions": {
                    "action1": {
                        "title": "Action #1"
                    },
                    "action2": {
                        "title": "Action #2"
                    },
                    "action3": {
                        "title": "Action #3"
                    }
                }
            }
        });

        // now register configuration for this module
        Ratchet.Configuration.add({
            "evaluator": "gadget",
            "condition": {
                "gadget": "gadget1",
                "gadgetType": "gadgetType1"
            },
            "config": {
                "buttonGroups": {
                    "bg1": {
                        "actions": [{
                            "action": "action1"
                        }, {
                            "action": "action2"
                        }]
                    },
                    "bg2": {
                        "actions": [{
                            "action": "action3"
                        }]

                    }
                }
            }
        });

        // now register configuration for this module
        Ratchet.Configuration.add({
            "evaluator": "gadget",
            "condition": {
                "gadget": "gadget2",
                "gadgetType": "gadgetType2"
            },
            "config": {
                "buttonGroups": {
                    "bg1": {
                        "actions": [{
                            "action": "action1"
                        }]
                    }
                }
            }
        });


        // some verification (gadget1)
        var json1 = Ratchet.Configuration.evaluate({
            "gadget": "gadget1",
            "gadgetType": "gadgetType1"
        });
        ok(json1.actions.action1.title, "Verify global action1");
        ok(json1.actions.action2.title, "Verify global action2");
        ok(json1.actions.action3.title, "Verify global action3");
        ok(!json1.actions.action4, "Verify global action4 not there");
        ok(json1.buttonGroups.bg1.actions, "BG1 evaluates ok");
        equal(json1.buttonGroups.bg1.actions.length, 2, "BG1 actions length == 2");
        ok(json1.buttonGroups.bg2.actions, "BG2 evaluates ok");

        // some verification (gadget2)
        var json2 = Ratchet.Configuration.evaluate({
            "gadget": "gadget2",
            "gadgetType": "gadgetType2"
        });
        ok(json2.actions.action1.title, "Verify global action1");
        ok(json2.actions.action2.title, "Verify global action2");
        ok(json2.actions.action3.title, "Verify global action3");
        ok(!json2.actions.action4, "Verify global action4 not there");
        ok(json2.buttonGroups.bg1.actions, "BG1 evaluates ok");
        equal(json2.buttonGroups.bg1.actions.length, 1, "BG1 actions length == 1");


        // now add a subscriber to listen for changes on evaluator gadget / gadget2
        var v1 = 0;
        var f = function() {
            console.log("FIRED");
            v1++;
        };
        Ratchet.Configuration.addListener({
            "evaluator": "gadget",
            "condition": {
                "gadget": "gadget2",
                "gadgetType": "gadgetType2"
            }
        }, f);

        // add more configuration
        Ratchet.Configuration.add({
            "evaluator": "gadget",
            "condition": {
                "gadget": "gadget2",
                "gadgetType": "gadgetType2"
            },
            "config": {
                "buttonGroups": {
                    "bg1": {
                        "actions": [{
                            "action": "action2"
                        }]
                    }
                }
            }
        });

        ok(v1 == 1, "Gadget2 subscriber triggered successfully (1)");

        // add more configuration
        Ratchet.Configuration.add({
            "evaluator": "gadget",
            "condition": {
                "gadget": "gadget2",
                "gadgetType": "gadgetType2"
            },
            "config": {
                "buttonGroups": {
                    "bg1": {
                        "actions": [{
                            "action": "action3"
                        }]
                    }
                }
            }
        });

        ok(v1 == 2, "Gadget2 subscriber triggered successfully (2)");

        // now unsubscribe
        Ratchet.Configuration.removeListener({
            "evaluator": "gadget",
            "condition": {
                "gadget": "gadget2",
                "gadgetType": "gadgetType2"
            }
        }, f);

        // add more configuration
        Ratchet.Configuration.add({
            "evaluator": "gadget",
            "condition": {
                "gadget": "gadget2",
                "gadgetType": "gadgetType2"
            },
            "config": {
                "buttonGroups": {
                    "bg2": {
                        "actions": [{
                            "action": "action1"
                        }]
                    }
                }
            }
        });

        ok(v1 == 2, "Gadget2 subscriber triggered successfully, did not change (1)");


        // now add listener and remove all
        Ratchet.Configuration.addListener({
            "evaluator": "gadget",
            "condition": {
                "gadget": "gadget2",
                "gadgetType": "gadgetType2"
            }
        }, f);
        Ratchet.Configuration.removeAllListeners({
            "evaluator": "gadget",
            "condition": {
                "gadget": "gadget2",
                "gadgetType": "gadgetType2"
            }
        });


        // add more configuration
        Ratchet.Configuration.add({
            "evaluator": "gadget",
            "condition": {
                "gadget": "gadget2",
                "gadgetType": "gadgetType2"
            },
            "config": {
                "buttonGroups": {
                    "bg2": {
                        "actions": [{
                            "action": "action1"
                        }]
                    }
                }
            }
        });

        ok(v1 == 2, "Gadget2 subscriber triggered successfully, did not change (2)");


        // all done
        start();
    });

}(jQuery) );