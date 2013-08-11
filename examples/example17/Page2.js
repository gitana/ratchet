(function($)
{
    Page2 = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            this.get("/page2", this.index);
        },

        index: function(el, callback)
        {
            el.transform("page2", function(el) {
                el.swap(function() {
                    callback();
                });
            });
        }
    });

    Ratchet.GadgetRegistry.register("page", Page2);

})(jQuery);