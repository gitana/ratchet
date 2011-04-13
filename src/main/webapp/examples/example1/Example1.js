(function($)
{
    /**
     * Example of a gadget that executes a controller and a view.
     */
    Example1 = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registrations
            this.route("/", "GET", this.view, this.controller);
        },

        controller: function(context, model)
        {
            model.observable("title", "Welcome to the index page");

            this.success(context, model);
        },

        view: function(context, model)
        {
            $(this.getContainer()).html(model.observable("title").get());

            this.success(context, model);
        }
    });

    Ratchet.GadgetRegistry.register("application", Example1);

})(jQuery);