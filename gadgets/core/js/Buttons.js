Ratchet.Gadgets.Buttons = Ratchet.AbstractDynamicGadget.extend({

    TEMPLATE: "core/gadgets/buttons",
    RUNTIME_CONTROLLER: "_gadgets/_runtime",

    prepareModel: function(el, config, callback)
    {
        if (!config.buttons)
        {
            config.buttons = [];
        }

        callback();
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


});

Ratchet.GadgetRegistry.register("buttons", Ratchet.Gadgets.Buttons);
