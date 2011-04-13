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
        },

        index: function(context, model)
        {
            // add anything we want to the model
            // i.e. declare any observables, populate observables, make available to templating engine
            model.observable("firstName");
            model.observable("lastName");
            model.dependentObservable("fullName", function() {
                return this.observable("firstName").get() + " " + this.observable("lastName").get();
            }, model);

            this.success(context, model);
        },

        submit: function(context, model)
        {
            var data = model.getData();

            // update observables
            model.observable("firstName").set(data.firstName);
            model.observable("lastName").set(data.lastName);

            // mark as having succeeded
            this.success(context, model);
        }

    });

    Ratchet.GadgetRegistry.register("application", Application);

})(jQuery);