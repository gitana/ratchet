(function($)
{
    Goodbye = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            // define a route
            this.get("/", function(el) {
                el.html("Goodbye").swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("goodbye", Goodbye);

})(jQuery);