(function($)
{
    Properties = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);
        },

        setup: function()
        {
            this.get(this.index);

            // subscribe to observable
            this.subscribe("fullName", function() {
                this.run("GET", "/");
            });
        },

        index: function(el)
        {
            // setup model
            el.model["firstName"] = this.observable("firstName").get("");
            el.model["lastName"] = this.observable("lastName").get("");
            el.model["fullName"] = this.observable("fullName").get("");

            el.transform("templates/properties", function(el) {
                el.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("properties", Properties);

})(jQuery);