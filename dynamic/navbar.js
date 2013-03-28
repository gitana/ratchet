(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");
            require("css!ratchet/dynamic/navbar.css");

            var html = require("text!ratchet/dynamic/navbar.html");
            var Ratchet = require("ratchet/web");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./navbar.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.Gadgets.NavBar = Ratchet.DynamicRegistry.register("navbar", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,

        prepareModel: function(el, model, callback)
	    {
            var self = this;

            this.base(el, model, function() {

                self.doPrepareModel(el, model);

                callback();

            });
	    },

        doPrepareModel: function(el, model)
        {
            // figure out the active page
            var pageKey = this.observable("page").get()["key"];
            for (var i = 0; i < model.items.length; i++)
            {
                var item = model.items[i];
                if (item.key == pageKey)
                {
                    item.classes = "active";
                }
            }

            // configure search
            if (model.search)
            {
                if (!model.search.placeholder) {
                    model.search.placeholder = "Search";
                }
            }

            // perform token substitutions
            // replace any { with ${ so that substitutions occur
            // we use "{" to parse tokens from URI and "${" to substitute in
            for (var i = 0; i < model.items.length; i++)
            {
                var item = model.items[i];
                if (item.uri)
                {
                    var last = 0;
                    var x = -1;
                    do
                    {
                        x = item.uri.indexOf("{", last);
                        if (x > -1)
                        {
                            item.uri = item.uri.substring(0, x) + item.uri.substring(x).replace("{", "${");
                            last = x + 2;
                        }
                    }
                    while (x > -1);
                }
            }
        }
		
	}));
}));
