(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            require("ratchet/dynamic/common.css");
            require("ratchet/dynamic/appbar.css");

            var html = require("ratchet/dynamic/appbar.html");
            var Ratchet = require("ratchet/web");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./appbar.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.Gadgets.AppBar = Ratchet.DynamicRegistry.register("appbar", Ratchet.AbstractDynamicGadget.extend({

        TEMPLATE: html,

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                self.doPrepareModel.call(self, el, model);

                callback();
            });
        },

        doPrepareModel: function(el, model)
        {
            // set user title
            model.userTitle = "Michael Uzquiano";

            // logo url should come from config, but if not set...
            if (!model.logoUri) {
                model.logoUri = "/images/applogo.png";
            }
        }


    }));
}));