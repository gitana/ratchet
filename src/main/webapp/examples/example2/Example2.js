(function($)
{
    /**
     * Example of a gadget with several controller-less views.
     */
    Example2 = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registrations
            this.route("/", "GET", this.index);
            this.route("/pages", "GET", this.pages);
            this.route("/pages/page1", "GET", this.page1);
            this.route("/pages/page2", "GET", this.page2);
        },

        index: function(context, model)
        {
            $(this.getContainer()).html("Index");
            $(this.getContainer()).append("<br/>");
            $(this.getContainer()).append("<a href='#/pages'>Pages</a>");
            $(this.getContainer()).append("<br/>");
            $(this.getContainer()).append("<a href='#/pages/page1'>Page 1</a>");
            $(this.getContainer()).append("<br/>");
            $(this.getContainer()).append("<a href='#/pages/page2'>Page 2</a>");

            this.success(context, model);
        },

        pages: function(context, model)
        {
            $(this.getContainer()).html("Pages");
        },

        page1: function(context, model)
        {
            $(this.getContainer()).html("Page 1");
        },

        page2: function(context, model)
        {
            $(this.getContainer()).html("Page 2");
        }

    });

    Ratchet.GadgetRegistry.register("application", Example2);

})(jQuery);