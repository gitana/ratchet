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
         * Asserts that a non-guest user is authenticated.
         *
         * If a non-guest user is not authenticated, this pops up a UI that allows the user to sign in
         * as a proper user.  It then handles coordination with browser state to establish the logged in user.
         *
         * @param context
         * @param successCallback
         * @param failureCallback
         */
        authenticateUser: function(context, successCallback, failureCallback)
        {
        },

        /**
         * EXTENSION POINT
         *
         * Asserts that a guest user is authenticated.
         *
         * If no one is logged in, this auto-signs in as "guest" and coordinates with browser state to
         * establish guest as the logged in user.
         *
         * If a user is logged in, this does nothing but instead simply skips out.
         *
         * @param context
         * @param successCallback
         * @param failureCallback
         */
        authenticateGuest: function(context, successCallback, failureCallback)
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
        },

        /**
         * Returns information about the currently authenticated user
         */
        currentUserName: function()
        {
        },

        /**
         * Returns information about the currently authenticated user
         */
        currentUserId: function()
        {
        },

        /**
         * Indicates whether there is an authenticated user or guest.
         */
        isAuthenticated: function()
        {

        },

        /**
         * Indicates whether a non-guest user is authenticated.
         */
        isUserAuthenticated: function()
        {

        },

        /**
         * Indicates whether a guest user is authenticated.
         */
        isGuestAuthenticated: function()
        {

        }
    });

})(jQuery);