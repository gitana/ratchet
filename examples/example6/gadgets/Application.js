(function($)
{
    Application = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            this.get("/", this.index);
        },

        index: function(el)
        {
            el.transform("templates/application", function(el) {
                el.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("application", Application);

})(jQuery);