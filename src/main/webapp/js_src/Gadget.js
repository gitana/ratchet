(function($)
{
    Ratchet.Gadget = Ratchet.Abstract.extend(
    {
        constructor: function(dispatcher, container)
        {
            this.base();

            this.dispatcher = dispatcher;
            this.container = container;
        },

        getDispatcher: function()
        {
            return this.dispatcher;
        },

        getContainer: function()
        {
            return this.container;
        },

        /**
         * @extension_point
         *
         * Initializes the gadget with the request-time model and view.
         * Allows the gadget to pick at any observables that it wants.
         *
         * @param modelAndView
         */
        setup: function(modelAndView)
        {

        },

        /**
         * @extension_point
         *
         * Renders the control.
         */
        render: function()
        {

        }

    });

})(jQuery);