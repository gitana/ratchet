(function($)
{
    Header = Ratchet.Gadget.extend(
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
            el.transform("templates/header", function() {
                el.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("header", Header);

})(jQuery);