(function($)
{
    Example2Controller = MVC.Controller.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);

            // don't register anything
            // let the requests flow through the view naturally

            //this.register("/", "GET", "index");
            //this.register("/pages", "GET", "pages");
            //this.register("/pages/page1", "GET", "page1");
            //this.register("/pages/page2", "GET", "page2");
        }

    });

    MVC.ControllerRegistry.register("example2", Example2Controller);

})(jQuery);