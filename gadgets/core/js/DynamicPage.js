(function($) {
    Ratchet.DynamicPage = Ratchet.AbstractDynamicPage.extend(
    {
        setup: function() {
            this.get(this.index);
        }
    });

    Ratchet.GadgetRegistry.register("body", Ratchet.DynamicPage);

})(jQuery);