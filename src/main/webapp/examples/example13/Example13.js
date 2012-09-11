(function($)
{
    Example13 = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            var self = this;

            // define a route
            this.get("/", function(el) {

                var originalHtml = $(this.ratchet().el).html();

                el.html("Gadget, id: " + self.getGadgetId() + ", type: " + self.getGadgetType() + ": " + originalHtml).swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("include", Example13);

})(jQuery);