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

        index: function(el)
        {
            el.html("Index")
                .append("<br/>")
                .append("<a href='#/pages/page1'>Page 1</a>")
                .append("<br/>")
                .append("<a href='#/pages/page2'>Page 2</a>")
                .append("<br/>")
                .append("<a href='#/pages/page3'>Page 3</a>")
                .append("<br/>")
                .swap();
        },

        page: function(el)
        {
            el.html("Page: " + el.tokens["page"]).swap();
        }

    });

    Ratchet.GadgetRegistry.register("application", Example3);

})(jQuery);