define(function(require, exports, module) {

    require("css!ratchet-gadgets/wizard-sidebar.css");

    var html = require("text!ratchet-gadgets/wizard-sidebar.html");
    var Ratchet = require("ratchet");

    return Ratchet.GadgetRegistry.register("wizard-sidebar", Ratchet.AbstractDynamicGadget.extend({

        TEMPLATE: html
    }));
});