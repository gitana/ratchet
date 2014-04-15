(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");
            require("css!ratchet/dynamic/dashboard.css");

            var html = require("text!ratchet/dynamic/dashboard.html");
            var Ratchet = require("ratchet/web");

            require("ratchet/handlebars");
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

                            if (!dashlet.config) {
                                dashlet.config = {};
                            }

                            /*
                            // the gadget configuration for the dashlets is not preloaded by the dynamic gadget code...
                            var c = Ratchet.Configuration.evaluate({
                                "gadgetType": dashlet.type,
                                "gadget": dashlet.id
                            });
                            if (c.gadgets && c.gadgets[dashlet.type] && c.gadgets[dashlet.type][dashlet.id])
                            {
                                // already configured into the configuration service

                                // we assume this also means that the dynamic dashlet gadget has been added to the
                                // gadget registry
                            }
                            else
                            {
                                // we need to create and apply the config
                                // we also need to register the dynamic dashlet gadget

                                // CONFIG
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
                                z.config.gadgets[dashlet.type][dashlet.id] = dashlet.config;
                                Ratchet.Configuration.add(z);
*/

                                // DYNAMIC GADGET INSTANCE
                                var dashletGadget = null;
                                if (Ratchet.DashletGadgets) {
                                    dashletGadget = Ratchet.DashletGadgets[dashlet.type];
                                }
                                if (dashletGadget)
                                {
                                    // register an instance of the dashlet as a gadget instance
                                    var newType = (function(gadgetConfiguration, dashletGadget) {

                                        // using meta-programming, create instances of gadget controllers
                                        // config is loaded by gadget on configure()
                                        return dashletGadget.extend({

                                            setup: function() {
                                                this.get(this.index);
                                            },

                                            configureDefault: function() {

                                                this.base();

                                                // push page configuration into config service
                                                this.config(gadgetConfiguration);
                                            }

                                        });

                                    }(dashlet.config, dashletGadget));

                                    Ratchet.GadgetRegistry.register(dashlet.type, dashlet.id, newType);
                                }
                            /*
                            }
                            */
                        }
                    }
                }

                callback();

            });
        }

	}));

}));
