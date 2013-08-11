(function($)
{
    Body2 = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            this.get("/page2", this.index);
        },

        index: function(el, callback)
        {
            el.transform("body2", function(el) {
                el.swap(function() {
                    callback();
                });
            });
        }
    });

    Ratchet.GadgetRegistry.register("body", Body2);

})(jQuery);