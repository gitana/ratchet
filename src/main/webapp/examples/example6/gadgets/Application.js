(function($)
{
    Application = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registrations
            this.route("/", "GET", "templates/application", this.index);
            this.route("/", "POST", this.submit);

            // custom observables
            this.firstName = this.scope().observable("firstName");
            this.lastName = this.scope().observable("lastName");
            this.fullName = this.scope().dependentObservable("fullName", function() {
                return this.observable("firstName").get("") + " " + this.observable("lastName").get("");
            }, this.scope());
        },

        /**
         * Controller method for index view.
         *
         * @param context
         * @param model
         */
        index: function(context, model)
        {
            // assign observable values into model
            model["firstName"] = this.firstName.get();
            model["lastName"] = this.lastName.get();

            this.success(context, model);
        },

        submit: function(context, model)
        {
            var data = context["data"];

            // update observables
            this.firstName.set(data.firstName);
            this.lastName.set(data.lastName);

            // mark as having succeeded
            this.success(context, model);
        }

    });

    Ratchet.GadgetRegistry.register("application", Application);

})(jQuery);