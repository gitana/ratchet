(function($) {
    Ratchet.AbstractDynamicGadget = Ratchet.Gadget.extend(
    {
        HTML: "",

        constructor: function(type, ratchet, id) {

            var self = this;

            this.base(type, ratchet, id);

            this.subscription = "gadget_" + type + "_" + id;
            this.defaultConfig = {};
            this.runtimeConfig = null;

            // override to support other config keys
            this.configKey = id;
            this.config = function()
            {
                var config = null;

                return function(reload) {

                    if (reload)
                    if (!config)
                    {
                        config = Ratchet.Configuration.evaluate({"gadget": self.configKey});
                    }

                    return config;
                };
            }();

        },

        /*
        _observable : function (key, args, defaultVal) {
            var _args = Ratchet.makeArray(args);
            if (_args.length > 0) {
                if (typeof _args[0] == "string") {
                    key = _args.shift();
                    if (_args.length > 0) {
                        this.observable(key).set(_args.shift());
                    }
                }
                else {
                    this.observable(key).set(_args.shift());
                }
            }
            var val = this.observable(key).get();
            if (val == null && defaultVal != null) {
                val = defaultVal;
                this.observable(key).set(defaultVal);
            }
            return val;
        },

        _clearObservable: function(key, defaultKey) {
            var _key = key ? key : defaultKey;
            this.observable(_key).clear();
        },
        */

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
