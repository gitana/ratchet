(function($)
{
    Example4Controller = Ratchet.Controller.extend(
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
            this.register("/", "GET", "index");

            // tokenized handler
            this.register("/test/{test1}/{test2}/{test3}", "GET", "test");

            // wildcard handler
            this.register("/wiki/**", "GET", "wiki");
        }

    });

    Ratchet.ControllerRegistry.register("example4", Example4Controller);

})(jQuery);