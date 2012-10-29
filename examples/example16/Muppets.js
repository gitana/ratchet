(function($)
{
    Ratchet.GadgetRegistry.register("spot", Ratchet.Gadget.extend({

        setup: function()
        {
            this.get("/muppets", this.index);
        },

        index: function(el)
        {
            el.html("List of Muppets<br/><br/><table><tr><td><a href='#/muppets/kermit'>Kermit the Frog</a></td></tr><tr><td><a href='#/muppets/gonzo'>Gonzo the Great</a></td></tr></table>").swap();
        }

    }));

})(jQuery);