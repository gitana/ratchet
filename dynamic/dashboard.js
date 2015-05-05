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

        /**
         * Extension point for letting configuration service load model configuration.
         *
         * @param model
         */
        applyDynamicConfiguration: function(model)
        {
        },

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                self.applyDynamicConfiguration(model);

                if (model.rows && model.rows.length > 0)
                {
                    // walk all dashlets and bind into observables
                    for (var i = 0; i < model.rows.length; i++)
                    {
                        var row = model.rows[i];

                        if (row.columns && row.columns.length > 0)
                        {
                            for (var j = 0; j < row.columns.length; j++)
                            {
                                var column = row.columns[j];

                                if (column.dashlets && column.dashlets.length > 0)
                                {
                                    for (var k = 0; k < column.dashlets.length; k++)
                                    {
                                        var dashlet = column.dashlets[k];

                                        if (!dashlet.config) {
                                            dashlet.config = {};
                                        }

                                        // DYNAMIC GADGET INSTANCE
                                        var dashletGadget = null;
                                        if (Ratchet.DashletGadgets) {
                                            dashletGadget = Ratchet.DashletGadgets[dashlet.type];
                                        }
                                        if (dashletGadget) {
                                            // register an instance of the dashlet as a gadget instance
                                            var newType = (function (gadgetConfiguration, dashletGadget) {

                                                // using meta-programming, create instances of gadget controllers
                                                // config is loaded by gadget on configure()
                                                return dashletGadget.extend({

                                                    setup: function () {
                                                        this.get(this.index);
                                                    },

                                                    configureDefault: function () {

                                                        this.base();

                                                        // push page configuration into config service
                                                        this.config(gadgetConfiguration);
                                                    }

                                                });

                                            }(dashlet.config, dashletGadget));

                                            Ratchet.GadgetRegistry.register(dashlet.type, dashlet.id, newType);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                callback();

            });
        }

	}));

}));
