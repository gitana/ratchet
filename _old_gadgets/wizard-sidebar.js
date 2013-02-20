define(function(require, exports, module) {

    require("css!ratchet/gadgets/common.css");
    require("css!ratchet/gadgets/wizard-sidebar.css");

    var html = require("text!ratchet/gadgets/wizard-sidebar.html");
    var Ratchet = require("ratchet/web");

    return Ratchet.DynamicRegistry.register("wizard-sidebar", Ratchet.AbstractDynamicGadget.extend({

        TEMPLATE: html
    }));
});