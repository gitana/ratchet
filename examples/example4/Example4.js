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

        index: function(el)
        {
            el.html("Index")
                .append("<br/>")
                .append("<a href='#/test/1/2/3'>Nested Test</a>")
                .append("<br/>")
                .append("<a href='#/wiki/a/whole/bunch/of/things'>Wiki Nested Test 1</a>")
                .append("<br/>")
                .append("<a href='#/wiki/and/some/more/things'>Wiki Nested Test 2</a>")
                .append("<br/>")
                .swap();
        },

        test: function(el)
        {
            el.html("Tokens")
                .append("<br>")
                .append("test1: " + el.tokens["test1"])
                .append("<br>")
                .append("test2: " + el.tokens["test2"])
                .append("<br>")
                .append("test3: " + el.tokens["test3"])
                .append("<br>")
                .swap();
        },

        wiki: function(el)
        {
            el.html("Wiki Page")
                .append("<br>")
                .append("**: " + el.tokens["**"])
                .swap();
        }

    });

    Ratchet.GadgetRegistry.register("application", Example4);

})(jQuery);