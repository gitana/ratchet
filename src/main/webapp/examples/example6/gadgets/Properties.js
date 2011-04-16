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

        index: function()
        {
            // setup model
            this.model["firstName"] = this.observable("firstName").get("");
            this.model["lastName"] = this.observable("lastName").get("");
            this.model["fullName"] = this.observable("fullName").get("");

            this.transform("templates/properties", function() {
                this.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("properties", Properties);

})(jQuery);