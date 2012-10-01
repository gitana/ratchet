(function($) {
    Ratchet.Gadgets.DynamicPage = Ratchet.AbstractDynamicPage.extend(
    {
        setup: function() {
            this.get(this.index);
        }
    });

    Ratchet.GadgetRegistry.register("body", Ratchet.Gadgets.DynamicPage);

})(jQuery);