(function($, window) {

    Ratchet.Authenticators.GitanaImplicitFlowAuthenticator = Ratchet.AbstractGitanaAuthenticator.extend({

        constructor: function(config)
        {
            this.base(config);

            this.accessToken = null;

            this.authorizationServerUrl = "https://api.cloudcms.com";
        },

        /**
         * Checks to see if an access token was handed back to us from the Gitana authorization server.
         * The access token is handed back in the hash (#accessToken=)
         *
         * If we find it, we pick it off and then clear the hash.
         *
         * Also checks to see if a GITANA_TICKET cookie is present.
         */
        init: function()
        {
            this.base();

            var _accessToken = Ratchet.hashParam("access_token");
            if (_accessToken)
            {
                this.accessToken = _accessToken;

                window.location.hash = "/";
            }

            /**
             * If we don't have a GITANA_TICKET and we also don't have an access token, then forward
             * off to the Gitana authorization server
             */
            if (!this.gitanaTicket)
            {
                if (!this.accessToken)
                {
                    // forward to authorization server
                    var clientKey = this.clientId;
                    var redirectUri = window.location.href;
                    if (redirectUri.indexOf("/#") > -1)
                    {
                        redirectUri = redirectUri.substring(0, redirectUri.indexOf("/#"));
                    }

                    // redirect to the Gitana authorization server
                    window.location.href = this.authorizationServerUrl + "/oauth/authorize?client_id=" + clientKey + "&redirect_uri=" + redirectUri + "&response_type=token&scope=api&auto_approve=true";
                }
            }
        },

        _authenticate: function(context, successCallback, failureCallback) {
            var self = this;

            // we only arrive here if we have a valid access token
            var redirectUri = window.location.href.substring(0, window.location.href.indexOf("#"));

            // init gitana
            var gitana = new Gitana(self.config.client);

            // now authenticate
            gitana.authenticate({
                "accessToken": this.accessToken,
                "redirectUri": redirectUri
            },function() {

                // should never arrive here!
                // the only way we could arrive here is if the access token we suddenly invalid or if someone
                // tried to spoof the system by pushing a fake access token at us
                if (failureCallback)
                {
                    failureCallback();
                }

            }).then(function() {

                self.handlePostAuthenticate(this, context, successCallback, failureCallback);

            });
        },

        authenticate: function(context, successCallback, failureCallback) {
            var self = this;

            if (CloudCMS.gitanaAuthenticated) {
                successCallback();
                return;
            }

            /**
             * If we made it this far, we must either have an access token or a GITANA_TICKET
             */
            if (this.accessToken)
            {
                // authenticate using the access token
                self._authenticate(context, successCallback, failureCallback);
            }
            else if (this.gitanaTicket)
            {
                // authenticate using the cookie
                self.authenticateWithCookie(context, successCallback, failureCallback);
            }
        },

        logout: function(context, callback) {
            var self = this;
            var platform = context.topRatchet().platform;
            platform.logout().then(function() {
                if (callback) {
                    callback();
                }
            });
        }
    });

})(jQuery, window);