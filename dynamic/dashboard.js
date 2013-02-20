(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");
            require("css!ratchet/dynamic/dashboard.css");

            var html = require("text!ratchet/dynamic/dashboard.html");
            var Ratchet = require("ratchet/web");

            require("ratchet/tmpl");
            require("bootstrap");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./dashboard.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.Gadgets.Dashboard = Ratchet.DynamicRegistry.register("dashboard", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                // walk all dashlets and bind into observables
                for (var i = 0; i < model.rows.length; i++)
                {
                    var row = model.rows[i];

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

                            //var subscriptionKey = "gadget_" + dashlet.type + "_" + dashlet.id;
                            //self.observable(subscriptionKey).set(dashletConfig);

                            // the gadget configuration for the dashlets is not preloaded by the dynamic gadget code...
                            var c = Ratchet.Configuration.evaluate({
                                "gadgetType": dashlet.type,
                                "gadget": dashlet.id
                            });
                            if (c.gadgets && c.gadgets[dashlet.type] && c.gadgets[dashlet.type][dashlet.id])
                            {
                                // already configured into the configuration service
                            }
                            else
                            {
                                var z = {
                                    "evaluator": "gadget",
                                    "condition": {
                                        "gadgetType": dashlet.type,
                                        "gadget": dashlet.id
                                    },
                                    "config": {
                                        "gadgets": {
                                        }
                                    }
                                };
                                z.config.gadgets[dashlet.type] = {};
                                z.config.gadgets[dashlet.type][dashlet.id] = dashletConfig;

                                // add to configuration service
                                Ratchet.Configuration.add(z);
                            }
                        }
                    }
                }

                callback();

            });
        }

	}));

}));
