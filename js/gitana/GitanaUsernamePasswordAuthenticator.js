(function($) {

    Ratchet.Authenticators.GitanaUsernamePasswordAuthenticator = Ratchet.AbstractGitanaAuthenticator.extend({

        _authenticate: function(context, username, password, successCallback, failureCallback)
        {
            var self = this;

            // init gitana
            var gitana = new Gitana(self.config.client);

            // now authenticate
            gitana.authenticate({
                "username": username,
                "password": password
            },function() {

                // failed, so pop up username/password dialog
                self.loginDialog(context, username, password, successCallback, failureCallback, true);

            }).then(function() {

                self.handlePostAuthenticate(this, context, successCallback, failureCallback);

            });
        },

        authenticate: function(context, successCallback, failureCallback)
        {
            var self = this;

            if (Gitana.Authentication.gitanaAuthenticated) {
                successCallback();
                return;
            }

            /**
             * Check for one of three scenarios:
             *
             *  1) This is the user's first arrival to the page.  In this case, they do not have a GITANA_TICKET
             *     cookie.  We pop up a dialog and ask for their username/password.
             *
             *  2) They have supplied their username/password via the dialog.
             *     We sign in to Gitana and acquire a GITANA_TICKET cookie and proceed with the app.
             *
             *  3) They already have a GITANA_TICKET cookie.  Authenticate using this cookie.
             *
             * If cookies are not supported by the browser, scenario #1 and #2 will occur for each page reload.
             */
            if (!this.gitanaTicket)
            {
                self.loginDialog(context, null, null, successCallback, failureCallback, false);
            }
            else
            {
                // authenticate using the cookie
                //self.authenticateWithCookie(context, successCallback, failureCallback);
                self.authenticateWithCookie(context, successCallback, function() {

                    // didn't work, pop up dialog
                    self.loginDialog(context, null, null, successCallback, failureCallback, true);
                });
            }
        },

        loginDialog : function(context, username, password, successCallback, failureCallback, retry)
        {
            var self = this;

            //  VIEW_WEB_EDIT_fieldSet

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
                options.fields.password['helper'] = "Login Failed. Try Again!";
            }

            // load the template
            $.ajax({
                url: "/components/ratchet-gitana/login.html",
                success: function(loginHtml)
                {
                    var div = $(loginHtml);

                    $('.modal-body', div).alpaca({
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

                            $(div).modal('show');
                            $(div).on('shown', function() {

                                control.getControlByPath("username").focus();

                            });
                        }
                    });
                }
            });
        }
    });

})(jQuery);