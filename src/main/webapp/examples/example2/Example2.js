(function($)
{
    Example2 = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

        setup: function()
        {
            this.get("/", this.index);
            this.get("/pages", this.pages);
            this.get("/pages/page1", this.page1);
            this.get("/pages/page2", this.page2);
        },

        index: function(el)
        {
            el.html("Index")
                .append("<br/>")
                .append("<a href='#/pages'>Pages</a>")
                .append("<br/>")
                .append("<a href='#/pages/page1'>Page 1</a>")
                .append("<br/>")
                .append("<a href='#/pages/page2'>Page 2</a>")
                .swap();
        },

        pages: function(el)
        {
            el.html("Pages").swap();
        },

        page1: function(el)
        {
            el.html("Page 1").swap();
        },

        page2: function(el)
        {
            el.html("Page 2").swap();
        }

    });

    Ratchet.GadgetRegistry.register("application", Example2);

})(jQuery);