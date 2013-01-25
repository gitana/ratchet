define(function(require, exports, module) {

    var html = require("text!ratchet-gadgets/buttons.html");
    var Ratchet = require("ratchet");

    require("ratchet-web");
    require("ratchet-tmpl");
    require("bootstrap");

    return Ratchet.GadgetRegistry.register("buttons", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,

	    prepareModel: function(el, config, callback)
	    {
            this.base(el, config, function() {

                if (!config.buttons)
                {
                    config.buttons = [];
                }

                callback();

            });
	    },

	    afterSwap: function(el, config, originalContext)
	    {
	        var self = this;

	        // walk all of the buttons
	        for (var i = 0; i < config.buttons.length; i++)
	        {
	            var item = config.buttons[i];
	            if (!item.header)
	            {
	                // title
	                (function(config, classname, item, originalContext) {
	                    $(el).find("." + classname).click(function() {
	                        self.handleClick.call(self, this, config, item, originalContext);
	                    });
	                })(config, "btn-item-title-" + i, item, originalContext);

	                // dropper
	                (function(config, classname, item, originalContext) {
	                    $(el).find("." + classname).click(function() {
	                        self.handleClick.call(self, this, config, item, originalContext);
	                    });
	                })(config, "btn-item-dropper-" + i, item, originalContext);
	            }
	        }

	        $(el).find('.btn').dropdown();
	    },

	    handleClick: function(clickedEl, model, item, originalContext)
	    {
	        if (item.link)
	        {
	            var tokens = originalContext.tokens;

	            // substitute back any tokens
	            var link = item.link;
	            for (var tokenId in tokens)
	            {
	                var tokenValue = tokens[tokenId];
	                link = link.replace("{" + tokenId + "}", tokenValue);
	            }
	            window.location.href = link;
	        }
	    }
	}));

});