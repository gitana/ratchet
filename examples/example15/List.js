(function($)
{
    Ratchet.GadgetRegistry.register("xyz", Ratchet.Gadget.extend({

        setup: function()
        {
            this.get(this.page);
        },

        page: function(el)
        {
            el.model["items"] = [{
                "uri": "http://www.cnn.com",
                "title": "CNN"
            }, {
                "uri": "http://www.yahoo.com",
                "title": "Yahoo"
            }, {
                "uri": "http://www.ft.com",
                "title": "Financial Times"
            }];

            el.transform("list", function(el) {
                el.swap();
            });
        }

    }));

})(jQuery);