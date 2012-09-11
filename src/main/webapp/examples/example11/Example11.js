(function($)
{
    Example11 = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

        setup: function()
        {
            // define a route
            this.get("/", function(el) {
                el.html("Welcome to the title page").swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("application", Example11);

})(jQuery);