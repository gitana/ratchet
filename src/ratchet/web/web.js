define(["ratchet/ratchet", "ratchet/config", "ratchet/messages", "ratchet/actions"], function() {

    require("./support/Dynamic");
    require("./support/AbstractDynamicGadget");
    require("./support/AbstractDashlet");
    require("./support/AbstractDynamicPage");
    require("./support/DynamicRegionResolver");
    require("./support/AbstractViewer");
    require("./support/ViewerRegistry");
    require("./support/AbstractEditor");
    require("./support/EditorRegistry");

    return require("ratchet/ratchet");
});
