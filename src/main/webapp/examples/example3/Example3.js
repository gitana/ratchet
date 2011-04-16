(function($)
{
    Example3 = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

        setup: function()
        {
            this.get("/", this.index);
            this.get("/pages/{page}", this.page);
        },

        index: function()
        {
            this.html("Index");
            this.append("<br/>");
            this.append("<a href='#/pages/page1'>Page 1</a>");
            this.append("<br/>");
            this.append("<a href='#/pages/page2'>Page 2</a>");
            this.append("<br/>");
            this.append("<a href='#/pages/page3'>Page 3</a>");
            this.append("<br/>");

            this.swap();
        },

        page: function()
        {
            this.html("Page: " + this.model.tokens["page"]).swap();
        }

    });

    Ratchet.GadgetRegistry.register("application", Example3);

})(jQuery);