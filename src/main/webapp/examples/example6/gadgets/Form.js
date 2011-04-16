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

        index: function(el)
        {
            var _this = this;

            el.model["firstName"] = this.observable("firstName").get();
            el.model["lastName"] = this.observable("lastName").get();

            // transform
            el.transform("templates/form", function(el) {

                // override the submit handlers
                var form = el.find("form");
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

                el.swap();
            });
        },

        submit: function(el, data)
        {
            this.observable("firstName").set(data.firstName);
            this.observable("lastName").set(data.lastName);
        }
    });

    Ratchet.GadgetRegistry.register("form", Form);

})(jQuery);