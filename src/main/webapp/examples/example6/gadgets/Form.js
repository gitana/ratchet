(function($)
{
    Form = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);
        },

        setup: function()
        {
            this.get(this.index);
            this.post(this.submit);

            // declare observables
            this.observable("firstName");
            this.observable("lastName");
            this.dependentObservable("fullName", function() {
                return this.observable("firstName").get("") + " " + this.observable("lastName").get("");
            });
        },

        index: function()
        {
            var _this = this;

            this.model["firstName"] = this.observable("firstName").get();
            this.model["lastName"] = this.observable("lastName").get();

            // transform
            this.transform("templates/form", function() {

                // override the submit handlers
                var form = this.find("form");
                $(form).find("input[type=submit]").click(function(event)
                {
                    event.preventDefault();

                    // convert form to json
                    _this.run("POST", "/", form.serializeObject());
                });

                // change the "lastName" field so it updates in real time
                $(form).find("input[name=lastName]").keyup(function(event)
                {
                    // convert form to json
                    _this.run("POST", "/", form.serializeObject());
                });

                this.swap();
            });
        },

        submit: function(data)
        {
            this.observable("firstName").set(data.firstName);
            this.observable("lastName").set(data.lastName);
        }
    });

    Ratchet.GadgetRegistry.register("form", Form);

})(jQuery);