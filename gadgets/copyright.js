define(function(require, exports, module) {

    require("css!ratchet-gadgets/common.css");

    var html = require("text!ratchet-gadgets/copyright.html");
    var Ratchet = require("ratchet-web");

    require("ratchet-tmpl");
    require("bootstrap");

    return Ratchet.GadgetRegistry.register("copyright", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html
		
	}));

});
