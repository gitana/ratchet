(function($)
{
    Example1Controller = MVC.Controller.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);

            // register a handler for the "/" path
            this.register("/", "GET", this.index);
        },

        /**
         * @override
         */
        index: function(modelAndView, onSuccess, onFailure)
        {
            modelAndView.set("title", "Welcome to the index page");
            modelAndView.setView("index");

            // render the view
            this.renderView(modelAndView, onSuccess, onFailure);
        }

    });

    MVC.ControllerRegistry.register("example1", Example1Controller);

})(jQuery);