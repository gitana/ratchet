(function($)
{
    Form = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registration
            this.route("/", "GET", "templates/form");
        },

        postRender: function(context, model)
        {
            var _this = this;

            // override the submit handlers
            var form = $(this.getContainer().find("form"));
            $(form).find("input[type=submit]").click(function(event)
            {
                event.preventDefault();

                // convert form to json
                var json = window.form2object(form[0]);

                // post to the application
                _this.post("/", json);
            });

            // change the "lastName" field so it updates in real time
            $(form).find("input[name=lastName]").keyup(function(event)
            {
                // convert form to json
                var json = window.form2object(form[0]);

                // post to the application
                _this.post("/", json);
            });

            this.base(context, model);
        }

    });

    Ratchet.GadgetRegistry.register("form", Form);

})(jQuery);