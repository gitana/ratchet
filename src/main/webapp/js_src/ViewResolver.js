(function($)
{
    MVC.ViewResolver = MVC.Abstract.extend(
    {
        constructor: function(dispatcher)
        {
            this.base();

            this.dispatcher = dispatcher;
        },

        getDispatcher: function()
        {
            return this.dispatcher;
        },

        getEl: function()
        {
            return this.getDispatcher().getElement();
        },

        register: function(uri, handler)
        {
            this.getDispatcher().mapView(this, uri, handler);
        }

        /**
         * Handles the render of the view.
         *
         * @param uri
         * @param method
         * @param modelAndView
         */
        /*
        handle: function(uri, modelAndView)
        {
            // TODO: override me
        }
        */

    });

})(jQuery);