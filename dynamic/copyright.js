(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");

            var html = require("text!ratchet/dynamic/copyright.html");
            var Ratchet = require("ratchet/web");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./copyright.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.Gadgets.Copyright = Ratchet.DynamicRegistry.register("copyright", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html
		
	}));

}));
