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

        index: function(el)
        {
            el.transform("templates/body", function() {
                el.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("body", Body);

})(jQuery);