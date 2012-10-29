(function($)
{
    Ratchet.GadgetRegistry.register("spot", Ratchet.Gadget.extend({

        setup: function()
        {
            this.get("/muppets/{muppet}", this.index);
        },

        index: function(el)
        {
            el.html("You are looking at a Muppet")
                .append("<br>")
                .append("Muppet: " + el.tokens["muppet"])
                .append("<br>")
                .swap();
        }

    }));

})(jQuery);