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

        page: function()
        {
            this.model["uri"] = this.route.uri;

            this.transform("templates/page", function() {
                this.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("page", Page);

})(jQuery);