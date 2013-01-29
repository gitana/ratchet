define(function(require, exports, module) {

    require("css!ratchet-gadgets/common.css");

    var html = require("text!ratchet-gadgets/buttons.html");
    var Ratchet = require("ratchet");

    require("ratchet-web");
    require("ratchet-tmpl");
    require("bootstrap");

    return Ratchet.GadgetRegistry.register("buttons", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,

	    prepareModel: function(el, model, callback)
	    {
            this.base(el, model, function() {

                if (!model.buttons)
                {
                    model.buttons = [];
                }

                callback();

            });
	    },

	    afterSwap: function(el, model, originalContext)
	    {
	        var self = this;

	        // walk all of the buttons
	        for (var i = 0; i < model.buttons.length; i++)
	        {
	            var item = model.buttons[i];
	            if (!item.header)
	            {
	                // title
	                (function(model, classname, item, originalContext) {
	                    $(el).find("." + classname).click(function() {
	                        self.handleClick.call(self, this, model, item, originalContext);
	                    });
	                })(model, "btn-item-title-" + i, item, originalContext);

	                // dropper
	                (function(model, classname, item, originalContext) {
	                    $(el).find("." + classname).click(function() {
	                        self.handleClick.call(self, this, model, item, originalContext);
	                    });
	                })(model, "btn-item-dropper-" + i, item, originalContext);
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