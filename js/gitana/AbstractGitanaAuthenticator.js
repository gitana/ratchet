(function($) {
    Ratchet.AbstractGitanaAuthenticator = Ratchet.AbstractAuthenticator.extend({

        constructor: function(config)
        {
            this.base(config);

            this.cleanCookies = function()
            {
                Gitana.deleteCookie("RATCHET_AUTH_USER_NAME");
                Gitana.deleteCookie("RATCHET_AUTH_USER_ID");
            }
        },

        /**
         * OVERRIDE
         */
        currentUserName: function()
        {
            return Gitana.readCookie('RATCHET_AUTH_USER_NAME');
        },

        /**
         * OVERRIDE
         */
        currentUserId: function()
        {
            return Gitana.readCookie('RATCHET_AUTH_USER_ID');
        },

        /**
         * OVERRIDE
         */
        isAuthenticated: function()
        {
            var self = this;

            var currentUserName = self.currentUserName();
            return (currentUserName ? true : false);
        },

        /**
         * OVERRIDE
         */
        isUserAuthenticated: function()
        {
            var self = this;

            var currentUserName = self.currentUserName();
            return (currentUserName && "guest" != currentUserName);
        },

        /**
         * OVERRIDE
         */
        isGuestAuthenticated: function()
        {
            var self = this;

            var currentUserName = self.currentUserName();
            return (currentUserName && "guest" == currentUserName);
        },

        /**
         * Retrieves the Gitana Ticket.
         *
         * @returns {*}
         */
        ticket: function()
        {
            return Gitana.readCookie('GITANA_TICKET');
        },

        /**
         * Authenticates using an existing GITANA_TICKET cookie in the browser.
         *
         * @param context
         * @param successCallback
         * @param failureCallback
         */
        authenticateWithCookie: function(context, successCallback, failureCallback)
        {
            var self = this;

            var config = {};
            if (self.config)
            {
                Ratchet.copyInto(config, self.config);
            }
            config.cookie = true;

            // connect to Gitana
            Gitana.connect(config, function(err) {

                // if err, then something went wrong
                if (err)
                {
                    if (failureCallback)
                    {
                        failureCallback();
                    }

                    return;
                }

                // no error

                // if an "application" was specified in the config...
                self.handlePostAuthenticate((this.platform ? this.platform() : this), context, successCallback, failureCallback);
            });
        },

        /**
         * To be called once authentication successfully completed.
         * This sets up any contextual information onto the top ratchet.
         *
         * @param platform
         * @param context
         * @param successCallback
         * @param failureCallback
         */
        handlePostAuthenticate: function(platform, context, successCallback, failureCallback)
        {
            var self = this;

            Gitana.Authentication.platform = function(platform) {
                return function() {
                    return Chain(platform);
                };
            }(platform);

            var authInfo = platform.getDriver().getAuthInfo();
            var username = authInfo.getPrincipalName();
            var userDomainQualifiedId = authInfo.getPrincipalDomainId() + "/" + authInfo.getPrincipalId();

            Gitana.writeCookie("RATCHET_AUTH_USER_NAME", username);
            Gitana.writeCookie("RATCHET_AUTH_USER_ID", userDomainQualifiedId);

            /*
            context.observable("authInfo").set(authInfo);

            self.populateTenant(context, authInfo);

            var userName = authInfo.getPrincipalName();
            var domainId = authInfo.getPrincipalDomainId();
            platform.readDomain(domainId).then(function() {
                context.observable("domain").set(this);
                this.readPrincipal(userName).then(function() {
                    self.populateAuthenticatedUser(context, this);
                });
            });
            */

            self.postLogin(platform, context, function() {

                self.onLogin(platform, context);

                platform.then(function() {
                    if (successCallback) {
                        successCallback();
                    }
                });

            });
        },

        /*
        populateAuthenticatedUser: function (context, user)
        {
            // update user observable
            context.observable("user").set(user);
            context.observable("userRoles").set({});

            // update user details observable
            var userDetails = user;
            userDetails['friendlyName'] = user["firstName"] ? user["firstName"] : user["name"];
            userDetails['fullName'] = user["firstName"] && user["lastName"] ? user["firstName"] + " " + user["lastName"] : userDetails['friendlyName'];
            userDetails['avatarUrl'] = user.getPreviewUri("avatar48", {
                "attachment": "avatar",
                "size": 48,
                "timestamp": new Date().getTime()
            });

            // load user settings
            context.observable("userDetails").set(userDetails);
        },

        populateTenant: function (context, authInfo) {

            // we build up an object to hold tenant info
            var tenantDetails = {
                "id": authInfo.getTenantId(),
                "title": authInfo.getTenantTitle(),
                "description": authInfo.getTenantDescription(),
                "friendlyName": authInfo.getTenantTitle() ? authInfo.getTenantTitle() : authInfo.getTenantId(),
                "avatarUrl": "" // TODO: platform attachment?
            };

            var platform = Gitana.Authentication.platform();
            tenantDetails['avatarUrl'] = platform.getTenantPreviewUri("avatar48", {
                "attachment": "avatar",
                "size": 48,
                "timestamp": new Date().getTime()
            });

            // update tenant observable
            context.observable("tenantDetails").set(tenantDetails);
        },
        */

        logout: function(callback)
        {
            var self = this;

            var platform = Gitana.Authentication.platform();
            platform.logout().then(function()
            {
                // clean out any cookies
                self.cleanCookies();

                self.postLogout(function() {

                    self.onLogout();

                    if (callback)
                    {
                        callback();
                    }

                });
            });
        },

        postLogin: function(platform, context, callback)
        {
            callback();
        },

        onLogin: function(platform, context)
        {

        },

        postLogout: function(callback)
        {
            callback();
        },

        onLogout: function()
        {

        }

    });

})(jQuery);