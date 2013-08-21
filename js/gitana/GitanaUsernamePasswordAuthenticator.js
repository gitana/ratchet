(function($) {

    Ratchet.Authenticators.GitanaUsernamePasswordAuthenticator = Ratchet.AbstractGitanaAuthenticator.extend({

        getTemplate: function()
        {
            return Ratchet.Authenticators.GitanaUsernamePasswordAuthenticator.LOGIN_TEMPLATE.trim();
        },

        _authenticate: function(context, username, password, successCallback, failureCallback)
        {
            var self = this;

            var config = {};
            if (self.config)
            {
                Ratchet.copyInto(config, self.config);
            }
            config.username = username;
            config.password = password;

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
                self.authenticateWithCookie(context, successCallback, function() {

                    // didn't work, pop up dialog
                    self.loginDialog(context, null, null, successCallback, failureCallback, false);
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
            var div = $(this.getTemplate());

            $('.modal-body', div).find('.login-body').alpaca({
                "view": "VIEW_WEB_CREATE",
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

                    control.childrenByPropertyId["username"].on("keypress", function(e) {

                        if (e.charCode === 13)
                        {
                            $(div).find(".login_button_login").click();
                        }
                    });

                    control.childrenByPropertyId["password"].on("keypress", function(e) {

                        if (e.charCode === 13)
                        {
                            $(div).find(".login_button_login").click();
                        }
                    });


                    $(div).modal('show');
                    $(div).on('shown.bs.modal', function() {

                        /*
                        $(div).css({
                            "margin-top": ($(div).outerHeight() / 2)
                        });
                        */

                        control.getControlByPath("username").focus();

                    });
                }
            });
        }
    });

    Ratchet.Authenticators.GitanaUsernamePasswordAuthenticator.LOGIN_TEMPLATE = ' \
        <div class="modal fade" style="overflow: visible !important"> \
            <div class="modal-dialog"> \
                <div class="modal-content"> \
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
                        <a href="javascript:void(0);" class="btn btn-default btn-primary login_button_login">Log In</a> \
                    </div> \
                </div> \
            </div> \
        </div> \
    ';

})(jQuery);