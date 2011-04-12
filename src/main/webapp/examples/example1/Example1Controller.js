(function($)
{
    Example1Controller = Ratchet.Controller.extend(
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
            // register a handler for the "/" path
            this.register("/", "GET", this.index);
        },

        index: function(modelAndView)
        {
            modelAndView.observable("title", "Welcome to the index page");
            modelAndView.setView("index");

            // end controller
            this.endController(modelAndView);
        }

    });

    Ratchet.ControllerRegistry.register("example1", Example1Controller);

})(jQuery);