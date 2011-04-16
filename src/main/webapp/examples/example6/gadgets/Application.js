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

        index: function()
        {
            this.transform("templates/application", function() {
                this.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("application", Application);

})(jQuery);