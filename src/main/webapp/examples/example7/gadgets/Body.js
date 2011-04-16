(function($)
{
    Body = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

        setup: function()
        {
            this.get(this.index);
        },

        index: function()
        {
            this.transform("templates/body", function() {
                this.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("body", Body);

})(jQuery);