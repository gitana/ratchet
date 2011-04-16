(function($)
{
    Page1 = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id ,ratchet);
        },

        setup: function()
        {
            this.get("/page1", this.index);
        },

        index: function()
        {
            this.transform("templates/page1", function() {
                this.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("page", Page1);

})(jQuery);