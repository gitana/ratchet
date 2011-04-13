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
            this.route("/", "GET", this.index, this._index);
        },

        /**
         * Controller method for index view.
         *
         * Note: by convention, controller methods start with _.
         *
         * @param context
         * @param model
         */
        _index: function(context, model)
        {
            model["title"] = "Welcome to the title page";

            this.success(context, model);
        },

        /**
         * View method for index view.
         *
         * @param context
         * @param model
         */
        index: function(context, model)
        {
            $(this.getContainer()).html(model["title"]);

            this.success(context, model);
        }
    });

    Ratchet.GadgetRegistry.register("application", Example1);

})(jQuery);