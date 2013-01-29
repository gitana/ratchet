(function($) {
    Ratchet.AbstractDynamicGadget = Ratchet.Gadget.extend(
    {
        RUNTIME_CONTROLLER: "_gadget",
        HTML: "",

        constructor: function(type, ratchet, id) {
            this.base(type, ratchet, id);

            this.subscription = "gadget_" + type + "_" + id;
            this.defaultConfig = {};
            this.runtimeConfig = null;

            this.enableRuntimeController = false;
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

            // ensure config is loaded
            // if already loaded, this just passes through
            this.loadConfig(el, function(config) {

                // make a copy of the config
                var model = JSON.parse(JSON.stringify(config));

                handleRender(el, model);

            });
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

        },

        loadConfig: function(el, callback)
        {
            var self = this;

            // see if we can get the live configuration from the observable
            // if so, then it was already calculated and set
            // if not, we have to load it
            var config = self.observable(self.subscription).get();
            if (config)
            {
                callback(config);
                return;
            }

            // fetch either from observable-init (if it was set ahead by the dynamic instantiation (dynamic.js)
            // or load from _gadget controller manually
            self.fetchInitialConfig(el, function(err, runtimeConfig) {

                if (runtimeConfig) {
                    self.runtimeConfig = runtimeConfig;
                } else {
                    self.runtimeConfig = {};
                }

                var config = {};

                // copy in default config
                if (self.defaultConfig)
                {
                    for (var k in self.defaultConfig)
                    {
                        config[k] = self.defaultConfig[k];
                    }
                }

                // allow runtime config to override the default config
                if (self.runtimeConfig)
                {
                    for (var k in self.runtimeConfig)
                    {
                        config[k] = self.runtimeConfig[k];
                    }
                }

                // store onto observable
                self.observable(self.subscription).set(config);

                config = self.observable(self.subscription).get();

                callback(config);
            });
        },

        fetchInitialConfig: function(el, callback)
        {
            var self = this;

            // load from initial observable and then clear it
            var observableConfig = self.observable(self.subscription + "-init").get();
            this.observable(self.subscription + "-init").clear();
            if (observableConfig)
            {
                callback(null, observableConfig);
                return;
            }

            // otherwise, retrieve from gadget controller?
            if (self.enableRuntimeController)
            {
                var url = self.RUNTIME_CONTROLLER + "?uri=" + el.route.uri + "&key=" + self.subscription;

                // call over to node js
                $.ajax({
                    "url": url,
                    "dataType": "json",
                    success: function(runtime)
                    {
                        self.observable(self.subscription + "-init").set(runtime.config);
                        callback(null, runtime.config);
                    },
                    error: function(http)
                    {
                        callback(http, null);
                    }
                });
            }
            else
            {
                callback(null, {});
            }
        },

        /**
         * Retrieves the live configuration for this gadget.
         *
         * @return {*}
         */
        config: function()
        {
            return this.observable(this.subscription).get();
        }

    });

    Ratchet.AbstractDashlet = Ratchet.AbstractDynamicGadget.extend({

        setup: function()
        {
            this.get(this.index);
        }

    });

})(jQuery);
