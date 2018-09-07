define(["ratchet/ratchet", "gitana", "alpaca", "./AbstractGitanaAuthenticator"], function(Ratchet, Gitana, Alpaca, AbstractGitanaAuthenticator) {

    return Ratchet.Authenticators.GitanaUsernamePasswordAuthenticator = AbstractGitanaAuthenticator.extend({

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
                        self.loginDialog(context, null, null, successCallback, failureCallback, null);
                    });

                    handled = true;
                }
            }

            if (!handled)
            {
                // make sure to clear out anything
                // self.cleanCookies();

                // pop up dialog
                self.loginDialog(context, null, null, successCallback, failureCallback, null);
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

        loginDialog : function(context, username, password, successCallback, failureCallback, err)
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
                        "type": "lowercase",
                        "disallowEmptySpaces": true,
                        "disallowOnlyEmptySpaces": true
                    },
                    "password": {
                        "type": "password"
                    }
                },
                "focus": true
            };

            var errorMessage = null;
            if (err) {
                errorMessage = "Unable to log in.  Please try again.";

                if (err.message) {
                    errorMessage = err.message;
                }
            }

            // load the template
            var div = $(this.getTemplate());

            $('.modal-body', div).find('.login-body').alpaca({
                "type": "create",
                "data": data,
                "schema": schema,
                "options": options,
                "postRender": function(control)
                {
                    if (errorMessage) {
                        $(".modal-body", div).find(".login-body").prepend("<div class='login-error-message'>" + errorMessage + "</div>");
                    }

                    $(div).find(".login_button_login").off().click(function(e) {

                        e.preventDefault();

                        var username = control.getValue()["username"];
                        var password = control.getValue()["password"];

                        self._authenticate(context, username, password, successCallback, failureCallback);

                        $(div).modal('hide');

                        return false;
                    });

                    $(div).find(".login_button_cancel").off().click(function() {

                        e.preventDefault();

                        $(div).modal('hide');

                        failureCallback();

                        return false;
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
                            // enable the login button
                            $(div).find(".login_button_login").attr("disabled", false);
                        }
                    };
                    enableDisableLoginButton();

                    usernameField.on("keypress", function(e) {

                        if (e.keyCode === 13)
                        {
                            $(div).find(".login_button_login").click();
                        }
                    });

                    passwordField.on("keypress", function(e) {

                        if (e.keyCode === 13)
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


                    $(div).on('shown.bs.modal', function() {

                        control.getControlByPath("username").focus();

                        // chrome: detect autofill - if so, enable submit button
                        // this make attempts for 10 seconds to see if the autofill happens by checking CSS
                        var t1 = new Date().getTime();
                        var fx = function() {
                            setTimeout(function() {
                                var x = control.field.find(":-webkit-autofill");
                                if (x.length > 0)
                                {
                                    // enable the login button
                                    $(div).find(".login_button_login").attr("disabled", false);
                                }
                                else
                                {
                                    var t2 = new Date().getTime();
                                    if (t2 - t1 < 10000)
                                    {
                                        fx();
                                    }
                                }
                            }, 250)
                        };
                        fx();

                    });
                    $(div).modal('show');
                }
            });
        },

        _authenticateAsGuest: function(context, successCallback, failureCallback)
        {
            var self = this;

            self._authenticate(context, null, null, successCallback, failureCallback, function(err, context, username, password, successCallback, failureCallback) {
                self.onConnectionFailure(err, context, username, password, successCallback, failureCallback);
            });
        },

        _authenticate: function(context, username, password, successCallback, failureCallback, connectFailureCallback)
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
                    if (connectFailureCallback)
                    {
                        return connectFailureCallback(err, context, username, password, successCallback, failureCallback);
                    }

                    return self.loginDialog(context, username, password, successCallback, failureCallback, err);
                }

                // no error

                // if an "application" was specified in the config...
                self.handlePostAuthenticate((this.platform ? this.platform() : this), context, successCallback, failureCallback);
            });
        },

        onConnectionFailure: function(err, context, username, password, successCallback, failureCallback)
        {
            var self = this;

            return self.loginDialog(context, username, password, successCallback, failureCallback, err);
        }

    });

    Ratchet.Authenticators.GitanaUsernamePasswordAuthenticator.LOGIN_TEMPLATE = ' \
        <div class="modal "' + Ratchet.defaultModalFadeClass + ' style="overflow: visible !important" data-keyboard="false" data-backdrop="static"> \
            <div class="modal-header"> \
                <h4>Log In</h4> \
            </div> \
            <div class="modal-body"> \
                <div class="login-header"></div> \
                <div class="login-body"></div> \
                <div class="login-footer"></div> \
            </div> \
            <div class="modal-footer"> \
                <!--<a href="javascript:void(0);" class="btn btn-default login_button_cancel">Cancel</a>--> \
                <a href="javascript:void(0);" class="btn btn-primary login_button_login">Log In</a> \
            </div> \
        </div> \
    ';

});