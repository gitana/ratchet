(function($)
{
    Example1ViewResolver = MVC.ViewResolver.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);

            // registers the "index" view
            this.register("index", this.index);
        },

        index: function(modelAndView)
        {
            $(this.getEl()).html(modelAndView.get("title"));
        }

    });

    MVC.ViewResolverRegistry.register("example1", Example1ViewResolver);

})(jQuery);