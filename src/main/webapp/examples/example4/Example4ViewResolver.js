(function($)
{
    Example4ViewResolver = Ratchet.ViewResolver.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);
        },

        registerMappings: function()
        {
            // register views
            this.register("index", this.index);
            this.register("test", this.test);
            this.register("wiki", this.wiki);
        },

        index: function(modelAndView)
        {
            $(this.getEl()).html("Index");
            $(this.getEl()).append("<br/>");
            $(this.getEl()).append("<a href='#/test/1/2/3'>Nested Test</a>");
            $(this.getEl()).append("<br/>");
            $(this.getEl()).append("<a href='#/wiki/a/whole/bunch/of/things'>Wiki Nested Test 1</a>");
            $(this.getEl()).append("<br/>");
            $(this.getEl()).append("<a href='#/wiki/and/some/more/things'>Wiki Nested Test 2</a>");
            $(this.getEl()).append("<br/>");
        },

        test: function(modelAndView)
        {
            $(this.getEl()).html("Tokens");
            $(this.getEl()).append("<br>");
            $(this.getEl()).append("test1: " + modelAndView.getToken("test1"));
            $(this.getEl()).append("<br>");
            $(this.getEl()).append("test2: " + modelAndView.getToken("test2"));
            $(this.getEl()).append("<br>");
            $(this.getEl()).append("test3: " + modelAndView.getToken("test3"));
            $(this.getEl()).append("<br>");
        },

        wiki: function(modelAndView)
        {
            $(this.getEl()).html("Wiki Page");
            $(this.getEl()).append("<br>");
            $(this.getEl()).append("**: " + modelAndView.getToken("**"));

        }

    });

    Ratchet.ViewResolverRegistry.register("example4", Example4ViewResolver);

})(jQuery);