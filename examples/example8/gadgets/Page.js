(function($)
{
    Page = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

        setup: function()
        {
            this.get(this.page);
        },

        page: function(el)
        {
            el.model["uri"] = el.route.uri;

            el.transform("templates/page", function(el) {
                el.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("page", Page);

})(jQuery);