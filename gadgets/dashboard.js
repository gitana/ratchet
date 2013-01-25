define(function(require, exports, module) {

    require("css!ratchet-gadgets/dashboard.css");

    var html = require("text!ratchet-gadgets/dashboard.html");
    var Ratchet = require("ratchet");

    require("ratchet-web");
    require("ratchet-tmpl");
    require("bootstrap");

    return Ratchet.GadgetRegistry.register("dashboard", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,

        index: function(el)
        {
            // get our configuration
            var config = this.observable(this.subscription).get();

            // walk all dashlets and bind into observables
            for (var i = 0; i < config.rows.length; i++)
            {
                var row = config.rows[i];

                for (var j = 0; j < row.columns.length; j++)
                {
                    var column = row.columns[j];

                    for (var k = 0; k < column.dashlets.length; k++)
                    {
                        var dashlet = column.dashlets[k];

                        var dashletConfig = dashlet.config;
                        if (!dashletConfig) {
                            dashletConfig = {};
                        }

                        var subscriptionKey = "gadget_" + dashlet.type + "_" + dashlet.id;
                        this.observable(subscriptionKey).set(dashletConfig);
                    }
                }
            }

            this.base(el);
        }
		
	}));

});
