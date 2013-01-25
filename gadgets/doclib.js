define(function(require, exports, module) {

    var html = require("text!ratchet-gadgets/doclib.html");
    var Ratchet = require("ratchet");

    require("ratchet-web");
    require("ratchet-tmpl");
    require("bootstrap");

    return Ratchet.GadgetRegistry.register("doclib", Ratchet.AbstractDynamicGadget.extend({

        TEMPLATE: html

    }));
});
