(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");
            require("css!ratchet/dynamic/empty.css");

            var html = require("text!ratchet/dynamic/empty.html");
            var Ratchet = require("ratchet/web");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./empty.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.Gadgets.Empty = Ratchet.GadgetRegistry.register("empty", Ratchet.AbstractDynamicGadget.extend({

        TEMPLATE: html,

        /**
         * @override
         */
        configureDefault: function()
        {
            // call this first
            this.base();

            // now add in our custom configuration
            this.config({
            });
        }

    }));

}));