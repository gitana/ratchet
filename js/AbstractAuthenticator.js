(function($) {
    Ratchet.AbstractAuthenticator = Base.extend({

        constructor: function(config)
        {
            this.config = config;
        },

        /**
         * EXTENSION POINT
         */
        init: function()
        {
        },

        /**
         * EXTENSION POINT
         *
         * @param context
         * @param successCallback
         * @param failureCallback
         */
        authenticate: function(context, successCallback, failureCallback)
        {
        },

        /**
         * EXTENSION POINT
         *
         * @param context
         * @param callback
         */
        logout: function(context,callback)
        {
        }
    });

})(jQuery);