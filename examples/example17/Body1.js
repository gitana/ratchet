(function($)
{
    Body1 = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            this.get("/page1", this.index);
        },

        index: function(el, callback)
        {
            el.transform("body1", function(el) {
                el.swap(function() {
                    callback();
                });
            });
        }
    });

    Ratchet.GadgetRegistry.register("body", Body1);

})(jQuery);