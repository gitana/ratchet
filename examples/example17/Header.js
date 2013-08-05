(function($)
{
    Header = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            this.get(this.index);
        },

        index: function(el, data, callback)
        {
            // intentionally wait 2 seconds before rendering to produce a delay
            // if swap process works correctly, this should not produce flicker
            window.setTimeout(function() {

                el.transform("header", function(el) {
                    el.swap(function() {
                        callback();
                    });
                });

            }, 2000);
        }
    });

    Ratchet.GadgetRegistry.register("header", Header);

})(jQuery);