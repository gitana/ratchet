(function($) {

    Ratchet.Authenticators.GitanaUsernamePasswordAuthenticator = Ratchet.AbstractGitanaAuthenticator.extend({

        /**
         * OVERRIDE
         */
        authenticateUser: function(context, successCallback, failureCallback)
        {
            var self = this;

            // are we already authenticated?
            var handled = false;
            if (self.isAuthenticated() && self.isUserAuthenticated())
            {
                // yes - therefore, we should have a cookie
                if (self.ticket())
                {
                    // authenticate using the cookie
                    self.authenticateWithCookie(context, successCallback, function() {

                        // didn't work, pop up dialog
                        self.loginDialog(context, null, null, successCallback, failureCallback, false);
                    });

                    handled = true;
                }
            }

            if (!handled)
            {
                // make sure to clear out anything
                // self.cleanCookies();

                // pop up dialog
                self.loginDialog(context, null, null, successCallback, failureCallback, false);
            }
        },

        /**
         * OVERRIDE
         */
        authenticateGuest: function(context, successCallback, failureCallback)
        {
            var self = this;

            // are we already authenticated as a user or a guest?
            var handled = false;
            if (self.isAuthenticated() && (self.isUserAuthenticated() || self.isGuestAuthenticated()))
            {
                // yes - therefore, we should have a cookie
                if (self.ticket())
                {
                    // authenticate using the cookie
                    self.authenticateWithCookie(context, successCallback, function() {

                        // didn't work, pop up dialog
                        self._authenticateAsGuest(context, successCallback, failureCallback, false);
                    });

                    handled = true;
                }
            }

            if (!handled)
            {
                // make sure to clear out anything
                // self.cleanCookies();

                // auto-authenticate as guest

                // pop up dialog
                self._authenticateAsGuest(context, successCallback, failureCallback, false);
            }
        },

        getTemplate: function()
        {
            return Ratchet.Authenticators.GitanaUsernamePasswordAuthenticator.LOGIN_TEMPLATE.trim();
        },

        loginDialog : function(context, username, password, successCallback, failureCallback, retry)
        {
            var self = this;

            var data = {
                "username" : username ? username : "",
                "password" : password ? password : ""
            };

            var schema = {
                "type": "object",
                "properties": {
                    "username": {
                        "title": "Username",
                        "type": "string"
                    },
                    "password": {
                        "title": "Password",
                        "type": "string"
                    }
                }
            };

            var options = {
                "fields": {
                    "username": {
                        "type": "text"
                    },
                    "password": {
                        "type": "password"
                    }
                }
            };

            if (retry) {
                //options.fields.password['helper'] = "Login Failed. Try Again!";
                options.fields.password['helper'] = "Unable to log in.  Please try again.";
            }

            // load the template
            var div = $(this.getTemplate());

            $('.modal-body', div).find('.login-body').alpaca({
                //"view": "VIEW_WEB_CREATE",
                "data": data,
                "schema": schema,
                "options": options,
                "postRender": function(control)
                {
                    $(div).find(".login_button_login").click(function(e) {

                        var username = control.getValue()["username"];
                        var password = control.getValue()["password"];

                        self._authenticate(context, username, password, successCallback, failureCallback);

                        $(div).modal('hide');
                    });

                    $(div).find(".login_button_cancel").click(function() {

                        $(div).modal('hide');

                        failureCallback();
                    });

                    var usernameField = control.childrenByPropertyId["username"];
                    var passwordField = control.childrenByPropertyId["password"];

                    var enableDisableLoginButton = function()
                    {
                        // disable the login button
                        $(div).find(".login_button_login").attr("disabled", true);

                        // if a username and password is provided, show the login button
                        if (usernameField.getValue() && passwordField.getValue())
                        {
                            // disable the login button
                            $(div).find(".login_button_login").attr("disabled", false);
                        }
                    };
                    enableDisableLoginButton();

                    usernameField.on("keypress", function(e) {

                        if (e.charCode === 13)
                        {
                            $(div).find(".login_button_login").click();
                        }
                    });

                    passwordField.on("keypress", function(e) {

                        if (e.charCode === 13)
                        {
                            $(div).find(".login_button_login").click();
                        }
                    });

                    usernameField.on("keyup", function(e) {
                        enableDisableLoginButton();
                    });

                    passwordField.on("keyup", function(e) {
                        enableDisableLoginButton();
                    });


                    $(div).modal('show');
                    $(div).on('shown.bs.modal', function() {

                        control.getControlByPath("username").focus();

                    });
                }
            });
        },

        _authenticateAsGuest: function(context, successCallback, failureCallback)
        {
            var self = this;

            self._authenticate(context, null, null, successCallback, failureCallback);
        },

        _authenticate: function(context, username, password, successCallback, failureCallback)
        {
            var self = this;

            var config = {};
            if (self.config)
            {
                Ratchet.copyInto(config, self.config);
            }
            if (username) {
                config.username = username;
            }
            if (password) {
                config.password = password;
            }

            // disconnect
            var disconnectKey = null;
            if (config.key) {
                disconnectKey = config.key;
            }
            Gitana.disconnect(disconnectKey);

            // connect to Gitana
            Gitana.connect(config, function(err) {

                // if err, then something went wrong
                if (err)
                {
                    self.loginDialog(context, username, password, successCallback, failureCallback, true);
                    return;
                }

                // no error

                // if an "application" was specified in the config...
                self.handlePostAuthenticate((this.platform ? this.platform() : this), context, successCallback, failureCallback);
            });
        }

    });

    Ratchet.Authenticators.GitanaUsernamePasswordAuthenticator.LOGIN_TEMPLATE = ' \
        <div class="modal fade" style="overflow: visible !important"> \
            <div class="modal-header"> \
                <h4>Log In</h4> \
            </div> \
            <div class="modal-body"> \
                <div class="login-header"></div> \
                <div class="login-body"></div> \
                <div class="login-footer"></div> \
            </div> \
            <div class="modal-footer"> \
                <a href="javascript:void(0);" class="btn btn-default login_button_cancel">Cancel</a> \
                <a href="javascript:void(0);" class="btn btn-primary login_button_login">Log In</a> \
            </div> \
        </div> \
    ';

})(jQuery);