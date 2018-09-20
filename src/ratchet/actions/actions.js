define(["ratchet/ratchet", "ratchet/config", "ratchet/messages", "./support/Actions"], function() {

    require("./support/AbstractAction");
    require("./support/AbstractUIAction");
    require("./support/ConsoleLogAction");
    require("./support/TestAction");

    return require("./support/Actions");
});
