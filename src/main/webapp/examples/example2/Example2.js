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
            this.route("/", "GET", this.view);
            this.route("/pages", "GET", this.viewPages);
            this.route("/pages/page1", "GET", this.viewPage1);
            this.route("/pages/page2", "GET", this.viewPage2);
        },

        view: function(context, model)
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

        viewPages: function(context, model)
        {
            $(this.getContainer()).html("Pages");
        },

        viewPage1: function(context, model)
        {
            $(this.getContainer()).html("Page 1");
        },

        viewPage2: function(context, model)
        {
            $(this.getContainer()).html("Page 2");
        }

    });

    Ratchet.GadgetRegistry.register("application", Example2);

})(jQuery);