(function($)
{
    Example3Controller = Ratchet.Controller.extend(
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
            this.register("/pages/{page}", "GET", "page");
        }

    });

    Ratchet.ControllerRegistry.register("example3", Example3Controller);

})(jQuery);