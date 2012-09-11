(function($)
{
    Hello = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

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