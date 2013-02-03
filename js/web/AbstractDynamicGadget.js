(function($) {
    Ratchet.AbstractDynamicGadget = Ratchet.Gadget.extend(
    {
        HTML: "",

        constructor: function(type, ratchet, id) {

            var self = this;

            this.base(type, ratchet, id);

            // override to support other config keys
            this.config = function(config)
            {
                if (config)
                {
                    var block = {
                        "evaluator": "gadget",
                        "condition": {
                            "gadgetId": self.getGadgetId(),
                            "gadgetType": self.getGadgetType()
                        },
                        "config": {}
                    };
                    Ratchet.merge(config, block.config);
                    Ratchet.Configuration.add(block);
                }

                return Ratchet.Configuration.evaluate({
                    "gadgetId": self.getGadgetId(),
                    "gadgetType": self.getGadgetType()
                });
            };

        },

        teardown: function()
        {
            var self = this;

            this.base();

            // remove all config listeners for this gadget
            Ratchet.Configuration.removeAllListeners({
                "evaluator": "gadget",
                "condition": {
                    "gadgetId": self.getGadgetId(),
                    "gadgetType": self.getGadgetType()
                }
            });
        },

        renderTemplate: function(el, templateIdentifier, data, callback) {

            if (data && callback) {
                el.transform(templateIdentifier, data, function(el) {
                    callback(el);
                });
            } else {
                callback = data;
                el.transform(templateIdentifier, function(el) {
                    callback(el);
                });
            }
        },

        index: function(el)
        {
            var self = this;

            var handleRender = function(el, model)
            {
                self.doRender(el, model);
            };

            var model = JSON.parse(JSON.stringify(this.config()));
            handleRender(el, model);
        },

        doRender: function(context, model)
        {
            var self = this;

            this.prepareModel(context, model, function() {
                self.render(context, model, function(el) {
                    self.beforeSwap(context, model, function() {
                        context.swap(function() {
                            self.afterSwap($(self.ratchet().el)[0], model, context, function() {

                                // nothing to do

                            });
                        });
                    });
                });
            });
        },

        render: function(el, model, callback)
        {
            var self = this;

            self.renderTemplate(el, self.TEMPLATE, model, function(el) {
                callback(el);
            });
        },

        prepareModel: function(el, model, callback)
        {
            if (!model.cssClasses) {
                model.cssClasses = "";
            }

            // add in a custom class for our gadget
            model.cssClasses += " " + this.getGadgetType();

            // allows for custom observable names
            if (!model.observables) {
                model.observables = {};
            }

            callback();
        },

        beforeSwap: function(el, model, callback)
        {
            if (callback)
            {
                callback();
            }
        },

        afterSwap: function(el, model, originalContext, callback)
        {

        }

    });

    Ratchet.AbstractDashlet = Ratchet.AbstractDynamicGadget.extend({

        setup: function()
        {
            this.get(this.index);
        }

    });

})(jQuery);
