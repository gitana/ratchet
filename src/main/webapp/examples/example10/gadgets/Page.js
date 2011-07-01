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
            this.observable('component').set({
                "value" : "Component Value"
            });

            this.observable('component1').set({
                "value" : "Component Value 1"
            });

            this.observable('component2').set({
                "value" : "Component Value 2"
            });

            el.transform("templates/page", function(el) {
                el.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("page", Page);

})(jQuery);