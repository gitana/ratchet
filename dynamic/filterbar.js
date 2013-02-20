(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");
            require("css!ratchet/dynamic/filterbar.css");

            var html = require("text!ratchet/dynamic/filterbar.html");
            var Ratchet = require("ratchet/web");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./filterbar.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.GadgetRegistry.register("filterbar", Ratchet.AbstractDynamicGadget.extend({

        TEMPLATE: html
    }));

}));