define(function(require, exports, module) {

    var html = require("text!ratchet-gadgets/sidebar.html");
    var Ratchet = require("ratchet");

    require("ratchet-web");
    require("ratchet-tmpl");
    require("bootstrap");

    return Ratchet.GadgetRegistry.register("sidebar", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,
		
	    prepareModel: function(el, config, callback)
	    {
            this.base(el, config, function() {

                if (!config.items)
                {
                    config.items = [];
                }

                callback();

            });
	    },

	    afterSwap: function(el, config, originalContext)
	    {
	        var self = this;

	        // walk all of the items
	        for (var i = 0; i < config.items.length; i++)
	        {
	            var item = config.items[i];
	            if (!item.header)
	            {
	                var classname = "sidebar-item-" + i;

	                // look up the dom element
	                (function(config, item, originalContext) {
	                    $("." + classname, el).click(function() {
	                        self.handleClick.call(self, this, config, item, originalContext);
	                    });
	                })(config, item, originalContext);
	            }
	        }
	    },

	    handleClick: function(clickedEl, model, item, originalContext)
	    {
	        if (item.link)
	        {
	            //window.location.href = Ratchet.Utils.substituteTokens(item.link, originalContext.tokens);
	            var uri = Ratchet.Utils.substituteTokens(item.link, originalContext.tokens);
	            originalContext.topRatchet().run(uri);
	        }
	    }		
	}));
});
