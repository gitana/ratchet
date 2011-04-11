(function($)
{
    Example3Controller = MVC.Controller.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);

            // registration using a tokenized handler

            this.register("/", "GET", "index");
            this.register("/pages/{page}", "GET", "page");
        }

    });

    MVC.ControllerRegistry.register("example3", Example3Controller);

})(jQuery);