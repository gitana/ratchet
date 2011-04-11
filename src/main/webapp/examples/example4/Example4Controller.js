(function($)
{
    Example4Controller = MVC.Controller.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);

            // registration using a tokenized handler

            this.register("/", "GET", "index");
            this.register("/test/{test1}/{test2}/{test3}", "GET", "test");
            this.register("/wiki/**", "GET", "wiki");
        }

    });

    MVC.ControllerRegistry.register("example4", Example4Controller);

})(jQuery);