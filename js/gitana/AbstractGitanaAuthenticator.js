(function($) {
    Ratchet.AbstractGitanaAuthenticator = Ratchet.AbstractAuthenticator.extend({

        constructor: function(config)
        {
            this.base(config);

            this.gitanaTicket = null;
        },

        /**
         * Stores the GITANA_TICKET
         */
        init: function()
        {
            this.base();

            this.gitanaTicket = Gitana.readCookie('GITANA_TICKET');
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

            // init gitana
            var config = {};
            if (self.config) {
                Ratchet.copyInto(config, self.config);
            }
            var gitana = new Gitana(config);

            // now authenticate
            gitana.authenticate({
                "cookie": true
            },function() {

                if (failureCallback)
                {
                    failureCallback();
                }

            }).then(function() {

                self.handlePostAuthenticate(this, context, successCallback, failureCallback);

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
            Gitana.Authentication.gitanaAuthenticated = true;

            var authInfo = platform.getDriver().getAuthInfo();

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

            platform.then(function() {
                if (successCallback) {
                    successCallback();
                }
            });
        },

        populateAuthenticatedUser: function (context, user)
        {
            // update user observable
            context.observable("user").set(user);
            context.observable("userRoles").set({});

            // update user details observable
            var userDetails = user;
            userDetails['friendlyName'] = user["firstName"] ? user["firstName"] : user["name"];
            userDetails['fullName'] = user["firstName"] && user["lastName"] ? user["firstName"] + " " + user["lastName"] : userDetails['friendlyName'];
            user.attachment('avatar').trap(function() {
                context.observable("userDetails").set(userDetails);
            }).then(function() {
                if (this.getLength() > 0) {
                    userDetails['avatarUrl'] = this.getDownloadUri()+ "?timestamp=" + new Date().getTime();
                }

                // load user settings
                context.observable("userDetails").set(userDetails);
            });
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

             platform.tenantAttachment('avatar').trap(function() {
                 context.observable("tenantDetails").set(tenantDetails);
             }).then(function() {
                 if (this.getLength() > 0) {
                     tenantDetails['avatarUrl'] = this.getDownloadUri()+ "?timestamp=" + new Date().getTime();
                 }

                 // load user settings
                 context.observable("tenantDetails").set(tenantDetails);
             });

             // update user observable
             //context.observable("tenantDetails").set(tenantDetails);
        },

        logout: function(context, callback)
        {
            var platform = Gitana.Authentication.platform();
            platform.logout().then(function()
            {
                if (callback)
                {
                    callback();
                }
            });
        }

    });

})(jQuery);