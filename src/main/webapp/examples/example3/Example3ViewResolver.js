(function($)
{
    Example3ViewResolver = MVC.ViewResolver.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);

            // register views
            this.register("index", this.index);
            this.register("page", this.page);
        },

        index: function(modelAndView)
        {
            $(this.getEl()).html("Index");
            $(this.getEl()).append("<br/>");
            $(this.getEl()).append("<a href='#/pages/page1'>Page 1</a>");
            $(this.getEl()).append("<br/>");
            $(this.getEl()).append("<a href='#/pages/page2'>Page 2</a>");
            $(this.getEl()).append("<br/>");
            $(this.getEl()).append("<a href='#/pages/page3'>Page 3</a>");
            $(this.getEl()).append("<br/>");
        },

        page: function(modelAndView)
        {
            $(this.getEl()).html("Page: " + modelAndView.getToken("page"));
        }

    });

    MVC.ViewResolverRegistry.register("example3", Example3ViewResolver);

})(jQuery);