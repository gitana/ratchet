(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) !== "undefined"))
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

                self.doPrepareModel(el, model, function() {
                    callback();
                });
            });
	    },

        doPrepareModel: function(el, model, callback)
        {
            var self = this;

            // find the active page item and mark it as such
            var pageUris = self.observable("page").get()["uri"];
            if (typeof(pageUris) === "string")
            {
                pageUris = [pageUris];
            }
            var maxLen = -1;
            var maxItem = null;
            for (var a = 0; a < pageUris.length; a++)
            {
                var pageUri = pageUris[a];

                for (var i = 0; i < model.items.length; i++)
                {
                    var item = model.items[i];
                    var uri = item.uri || item.link;
                    if (uri.indexOf("#") === 0) {
                        uri = uri.substring(1);
                    }
                    //if (pageUri.indexOf(uri) === 0 && uri.length > maxLen)
                    if (pageUri == uri)
                    {
                        maxLen = uri.length;
                        maxItem = item;
                    }
                }
            }
            if (maxItem)
            {
                maxItem.classes = "active";
            }



            // configure search
            if (model.search)
            {
                if (!model.search.placeholder) {
                    model.search.placeholder = "Search";
                }
            }

            // configure brand
            if (model.brand)
            {
                if (!model.brand.uri)
                {
                    model.brand.uri = "/";
                }
            }

            var tokenSubstitutionFunction = function(uri)
            {
                var last = 0;
                var x = -1;
                do
                {
                    x = uri.indexOf("{", last);
                    if (x > -1)
                    {
                        uri = uri.substring(0, x) + uri.substring(x).replace("{", "${");
                        last = x + 2;
                    }
                }
                while (x > -1);

                return uri;
            };

            // perform token substitutions
            // replace any { with ${ so that substitutions occur
            // we use "{" to parse tokens from URI and "${" to substitute in
            for (var i = 0; i < model.items.length; i++)
            {
                var item = model.items[i];
                if (item.uri)
                {
                    item.uri = tokenSubstitutionFunction(item.uri);
                }
            }
            if (model.brand && model.brand.uri)
            {
                model.brand.uri = tokenSubstitutionFunction(model.brand.uri);
            }

            callback();
        }
		
	}));
}));
