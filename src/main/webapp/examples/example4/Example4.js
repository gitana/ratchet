(function($)
{
    /**
     * Example of a gadget that tokenizes the URL and displays token info.
     */
    Example4 = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registrations
            this.route("/", "GET", this.view);
            this.route("/test/{test1}/{test2}/{test3}", "GET", this.viewTest);
            this.route("/wiki/**", "GET", this.viewWiki);
        },

        view: function(context, model)
        {
            $(this.getContainer()).html("Index");
            $(this.getContainer()).append("<br/>");
            $(this.getContainer()).append("<a href='#/test/1/2/3'>Nested Test</a>");
            $(this.getContainer()).append("<br/>");
            $(this.getContainer()).append("<a href='#/wiki/a/whole/bunch/of/things'>Wiki Nested Test 1</a>");
            $(this.getContainer()).append("<br/>");
            $(this.getContainer()).append("<a href='#/wiki/and/some/more/things'>Wiki Nested Test 2</a>");
            $(this.getContainer()).append("<br/>");

            this.success(context, model);
        },

        viewTest: function(context, model)
        {
            $(this.getContainer()).html("Tokens");
            $(this.getContainer()).append("<br>");
            $(this.getContainer()).append("test1: " + model.getToken("test1"));
            $(this.getContainer()).append("<br>");
            $(this.getContainer()).append("test2: " + model.getToken("test2"));
            $(this.getContainer()).append("<br>");
            $(this.getContainer()).append("test3: " + model.getToken("test3"));
            $(this.getContainer()).append("<br>");

            this.success(context, model);
        },

        viewWiki: function(context, model)
        {
            $(this.getContainer()).html("Wiki Page");
            $(this.getContainer()).append("<br>");
            $(this.getContainer()).append("**: " + model.getToken("**"));

            this.success(context, model);
        }

    });

    Ratchet.GadgetRegistry.register("application", Example4);

})(jQuery);