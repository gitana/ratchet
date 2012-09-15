(function($)
{
    Hello = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            // define a route
            this.get("/", function(el) {
                el.html("HELLO").swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("hello", Hello);

})(jQuery);