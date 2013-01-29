define(function(require, exports, module) {

    require("css!ratchet-gadgets/common.css");
    require("css!ratchet-gadgets/navbar.css");

    var html = require("text!ratchet-gadgets/navbar.html");
    var Ratchet = require("ratchet");

    require("ratchet-web");
    require("ratchet-tmpl");
    require("bootstrap");

    return Ratchet.GadgetRegistry.register("navbar", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,
		
	    prepareModel: function(el, model, callback)
	    {
            var self = this;

            this.base(el, model, function() {

                self.doPrepareModel(el, model);

                callback();

            });
	    },

        doPrepareModel: function(el, model)
        {
            // figure out the active page
            var pageKey = this.observable("page").get()["key"];
            for (var i = 0; i < model.items.length; i++)
            {
                var item = model.items[i];
                if (item.key == pageKey)
                {
                    item.classes = "active";
                }
            }

            // configure search
            if (model.search)
            {
                if (!model.search.placeholder) {
                    model.search.placeholder = "Search";
                }
            }

            // configure brandh
            if (model.brand)
            {
                if (!model.brandTitle) {
                    model.brandTitle = this.observable("application").get()["title"];
                }
            }

            // perform token substitutions
            for (var i = 0; i < model.items.length; i++)
            {
                var item = model.items[i];

                // substitute any tokens
                var x = -1;
                do
                {
                    x = item.uri.indexOf("{");
                    if (x > -1)
                    {
                        var y = item.uri.indexOf("}", x);
                        if (y > -1)
                        {
                            var token = item.uri.substring(x+1, y);
                            var replacementToken = el.tokens[token];
                            item.uri = item.uri.substring(0,x) + replacementToken + item.uri.substring(y+1);
                        }
                    }
                }
                while(x > -1);

            }
        }
		
	}));
});
