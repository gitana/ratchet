(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");
            require("css!ratchet/dynamic/sidebar.css");

            var html = require("text!ratchet/dynamic/sidebar.html");
            var Ratchet = require("ratchet/web");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./sidebar.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.DynamicRegistry.register("sidebar", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,
		
	    prepareModel: function(el, model, callback)
	    {
            var self = this;

            this.base(el, model, function() {

                if (!model.items)
                {
                    model.items = [];
                }

                self.doPrepareModel(el, model);

                callback();

            });
	    },

        doPrepareModel: function(el, model)
        {
            var self = this;

            // walk all items and mark the current on
            var pageUris = self.observable("page").get()["uri"];
            if (typeof(pageUris) === "string")
            {
                pageUris = [pageUris];
            }
            var maxLen = -1;
            var maxItem = null;
            for (var a = 0; a < pageUris.length; a++)
            {
                var pageUri = pageUris[a]; // does not have hash

                for (var i = 0; i < model.items.length; i++)
                {
                    var item = model.items[i];
                    var uri = item.uri || item.link;
                    if (uri)
                    {
                        if (uri.indexOf("#") === 0) {
                            uri = uri.substring(1);
                        }
                        if (pageUri.indexOf(uri) === 0 && uri.length > maxLen)
                        {
                            maxLen = uri.length;
                            maxItem = item;
                        }
                    }
                }
            }
            if (maxItem)
            {
                maxItem.classes = "active";
            }
        },

	    afterSwap: function(el, model, originalContext, callback)
	    {
	        var self = this;

	        // walk all of the items
	        for (var i = 0; i < model.items.length; i++)
	        {
	            var item = model.items[i];
	            if (!item.header)
	            {
	                var classname = "sidebar-item-" + i;

	                // look up the dom element
	                (function(model, item, originalContext) {
	                    $(el).find("." + classname).click(function() {
	                        self.handleClick.call(self, this, model, item, originalContext);
	                    });
	                })(model, item, originalContext);
	            }
	        }

            if (callback)
            {
                callback();
            }

	    },

	    handleClick: function(clickedEl, model, item, originalContext)
	    {
	        if (item.link)
	        {
                var uri = Ratchet.substituteTokens(item.link, originalContext.tokens);

                if (item.newWindow)
                {
                    window.open(uri);
                    return;
                }
                else
                {
                    originalContext.topRatchet().run(uri);
                }
	        }
	    }		
	}));
}));
