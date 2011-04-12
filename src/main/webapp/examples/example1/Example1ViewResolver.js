(function($)
{
    Example1ViewResolver = Ratchet.ViewResolver.extend(
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
            // registers the "index" view
            this.register("index", this.index);
        },

        index: function(modelAndView)
        {
            $(this.getEl()).html(modelAndView.observable("title").get());
        }

    });

    Ratchet.ViewResolverRegistry.register("example1", Example1ViewResolver);

})(jQuery);