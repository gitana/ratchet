(function($)
{
    Application = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

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