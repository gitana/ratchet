(function($)
{
    FormGadget = Ratchet.Gadget.extend(
    {
        constructor: function(dispatcher, container)
        {
            this.base(dispatcher, container);
        },

        setup: function(modelAndView)
        {
            this.firstName = modelAndView.observable("firstName");
            this.lastName = modelAndView.observable("lastName");
            this.fullName = modelAndView.observable("fullName");
        },

        render: function()
        {
            var _this = this;

            var form = $("<form method='post' action='#/'><table><tr><td>First name</td><td><input type='text' name='firstName' value='" + this.firstName.get() + "'/></td></tr><tr><td>Last name</td><td><input type='text' name='lastName' value='" + this.lastName.get() + "'></td></tr></table></form>");
            var button = $("<input type='button' value='SUBMIT IT'/>");

            var container = this.getContainer();
            $(container).html("");
            $(container).append(form);
            $(container).append(button);
            $(button).click(function()
            {
                // convert form to json
                var json = window.form2object(form[0]);

                // fire to dispatcher
                _this.getDispatcher().post("/", json);
            });

        }

    });

    Ratchet.GadgetRegistry.register("form", FormGadget);

})(jQuery);