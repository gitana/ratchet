(function($)
{
    Example6Controller = Ratchet.Controller.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);
        },

        /**
         * @override
         */
        registerMappings: function()
        {
            this.register("/", "GET", this.index);
            this.register("/", "POST", this.submit);
        },

        index: function(modelAndView)
        {
            // register two observables and a dependent observable
            modelAndView.observable("firstName");
            modelAndView.observable("lastName");
            modelAndView.dependentObservable("fullName", function() {

                return this.observable("firstName").get() + " " + this.observable("lastName").get();

            }, modelAndView);

            // set the view name
            modelAndView.setView("index");

            // end controller
            this.endController(modelAndView);
        },

        submit: function(modelAndView)
        {
            var data = modelAndView.getData();

            // TODO: update observables
            modelAndView.observable("firstName").set(data.firstName);
            modelAndView.observable("lastName").set(data.lastName);
        }

    });

    Ratchet.ControllerRegistry.register("example6", Example6Controller);

})(jQuery);