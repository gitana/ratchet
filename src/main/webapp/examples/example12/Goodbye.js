(function($)
{
    Goodbye = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

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