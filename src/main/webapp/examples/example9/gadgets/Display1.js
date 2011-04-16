(function($)
{
    Display1 = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

        setup: function()
        {
            this.get(this.index);

            // subscribe to observable
            this.subscribe("value", function() {

                Ratchet.debug("Display 1 updating: " + this.observable("value").get());

                this.run("GET", "/");
            });
        },

        index: function()
        {
            this.model["value"] = this.observable("value").get();

            this.transform("templates/display1", function() {
                this.swap();
            });

        }
    });

    Ratchet.GadgetRegistry.register("display1", Display1);

})(jQuery);