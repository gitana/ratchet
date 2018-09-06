(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            require("ratchet/dynamic/common.css");
            require("ratchet/dynamic/empty.css");

            var html = require("ratchet/dynamic/empty.html");
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