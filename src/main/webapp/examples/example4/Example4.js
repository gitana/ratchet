(function($)
{
    Example4 = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

        setup: function()
        {
            this.get("/", this.index);
            this.get("/test/{test1}/{test2}/{test3}", this.test);
            this.get("/wiki/**", this.wiki);
        },

        index: function()
        {
            this.html("Index");
            this.append("<br/>");
            this.append("<a href='#/test/1/2/3'>Nested Test</a>");
            this.append("<br/>");
            this.append("<a href='#/wiki/a/whole/bunch/of/things'>Wiki Nested Test 1</a>");
            this.append("<br/>");
            this.append("<a href='#/wiki/and/some/more/things'>Wiki Nested Test 2</a>");
            this.append("<br/>");

            this.swap();
        },

        test: function()
        {
            this.html("Tokens");
            this.append("<br>");
            this.append("test1: " + this.model.tokens["test1"]);
            this.append("<br>");
            this.append("test2: " + this.model.tokens["test2"]);
            this.append("<br>");
            this.append("test3: " + this.model.tokens["test3"]);
            this.append("<br>");

            this.swap();
        },

        wiki: function()
        {
            this.html("Wiki Page");
            this.append("<br>");
            this.append("**: " + this.model.tokens["**"]);

            this.swap();
        }

    });

    Ratchet.GadgetRegistry.register("application", Example4);

})(jQuery);