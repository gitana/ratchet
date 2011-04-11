(function($)
{
    Example2ViewResolver = Ratchet.ViewResolver.extend(
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
            // register views
            this.register("index", this.index);
            this.register("pages", this.pages);
            this.register("pages/page1", this.page1);
            this.register("pages/page2", this.page2);
        },

        index: function(modelAndView)
        {
            $(this.getEl()).html("Index");
            $(this.getEl()).append("<br/>");
            $(this.getEl()).append("<a href='#/pages'>Pages</a>");
            $(this.getEl()).append("<br/>");
            $(this.getEl()).append("<a href='#/pages/page1'>Page 1</a>");
            $(this.getEl()).append("<br/>");
            $(this.getEl()).append("<a href='#/pages/page2'>Page 2</a>");
        },

        pages: function(modelAndView)
        {
            $(this.getEl()).html("Pages");
        },

        page1: function(modelAndView)
        {
            $(this.getEl()).html("Page 1");
        },

        page2: function(modelAndView)
        {
            $(this.getEl()).html("Page 2");
        }

    });

    Ratchet.ViewResolverRegistry.register("example2", Example2ViewResolver);

})(jQuery);