(function($)
{
    Page2 = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id ,ratchet);
        },

        setup: function()
        {
            this.get("/page2", this.index);
        },

        index: function(el)
        {
            el.transform("templates/page2", function(el) {
                el.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("page", Page2);

})(jQuery);