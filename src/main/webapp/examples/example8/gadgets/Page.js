(function($)
{
    Page = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registration
            this.route("**", "GET", "templates/page", this.controller);
        },

        controller: function(context, model)
        {
            model["uri"] = context.uri;

            this.success(context, model);
        }
    });

    Ratchet.GadgetRegistry.register("application", Page);

})(jQuery);