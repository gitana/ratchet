(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
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
            this.base(el, model, function() {

                if (!model.items)
                {
                    model.items = [];
                }

                callback();

            });
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
