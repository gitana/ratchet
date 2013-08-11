(function($)
{
    Page1 = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            this.get("/page1", this.index);
        },

        index: function(el, callback)
        {
            el.transform("page1", function(el) {
                el.swap(function() {
                    callback();
                });
            });
        }
    });

    Ratchet.GadgetRegistry.register("page", Page1);

})(jQuery);