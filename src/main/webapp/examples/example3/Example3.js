(function($)
{
    /**
     * Example of a gadget that tokenizes the URL and displays token info.
     */
    Example3 = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registrations
            this.route("/", "GET", this.index);
            this.route("/pages/{page}", "GET", this.page);
        },

        index: function(context, model)
        {
            $(this.getContainer()).html("Index");
            $(this.getContainer()).append("<br/>");
            $(this.getContainer()).append("<a href='#/pages/page1'>Page 1</a>");
            $(this.getContainer()).append("<br/>");
            $(this.getContainer()).append("<a href='#/pages/page2'>Page 2</a>");
            $(this.getContainer()).append("<br/>");
            $(this.getContainer()).append("<a href='#/pages/page3'>Page 3</a>");
            $(this.getContainer()).append("<br/>");

            this.success(context, model);
        },

        page: function(context, model)
        {
            $(this.getContainer()).html("Page: " + model.getToken("page"));

            this.success(context, model);
        }

    });

    Ratchet.GadgetRegistry.register("application", Example3);

})(jQuery);