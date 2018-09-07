define(["ratchet/ratchet"], function(Ratchet) {

    return Ratchet.AbstractDynamicGadget = Ratchet.Gadget.extend(
    {
        HTML: "",

        constructor: function(type, ratchet, id) {

            var self = this;

            this.base(type, ratchet, id);

            // this method provides a way to register dynamic configuration upon instantiation
            var blockKeys = [];
            this.config = function(config)
            {
                var type = self.getGadgetType();
                var id = self.getGadgetId();

                if (config)
                {
                    // add config
                    var block = {
                        "evaluator": "gadget",
                        "condition": {
                            "gadget": id,
                            "gadgetType": type
                        },
                        "config": {
                            "gadgets": {}
                        }
                    };
                    block.config.gadgets[type] = {};
                    block.config.gadgets[type][id] = {};
                    Ratchet.merge(config, block.config.gadgets[type][id]);
                    var blockKey = Ratchet.Configuration.add(block);

                    blockKeys.push(blockKey);
                }

                var c = {};
                var gadgetConfig = Ratchet.Configuration.evaluate({
                    "gadget": id,
                    "gadgetType": type
                });
                if (gadgetConfig.gadgets && gadgetConfig.gadgets[type] && gadgetConfig.gadgets[type][id])
                {
                    Ratchet.merge(gadgetConfig.gadgets[type][id], c);
                }
                else
                {
                    //console.log("Gadget config does not have gadgets[" + type + "][" + id + "] element");
                }
                return c;
            };

            this.releaseAllConfigs = function()
            {
                for (var i = 0; i < blockKeys.length; i++)
                {
                    Ratchet.Configuration.release(blockKeys[i]);
                }
            };

            /////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // DYNAMIC STORAGE
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////

            this.store = function(key, value)
            {
                if (!self.storage && self.storageKey()) {
                    self.storage = new Ratchet.Storage(self.storageKey());
                }

                return self.storage.poke(key, value);
            };
        },

        browserLocale: function()
        {
            return "en_US";
        },

        msg: function(key)
        {
            var self = this;

            if (!self._messages) {
                self._messages = Ratchet.Messages.using(self.browserLocale(), Ratchet.Configuration);
            }

            var value = self._messages.message(key);
            if (!value) {
                value = self._messages.message("tokens." + key);
            }

            return value;
        },

        storageKey: function()
        {
            var self = this;

            var storageKey = self.config().storageKey;
            if (!storageKey) {
                storageKey = self.type;
            }

            return storageKey;
        },

        /**
         * @override
         */
        configure: function(gadgetIdentifier)
        {
            this.base(gadgetIdentifier);

            if (this.getGadgetId())
            {
                this.configureDefault();
                this.configureAutowire();
            }
        },

        /**
         * @extension_point
         *
         *
         */
        configureDefault: function()
        {
        },

        /**
         * @extension_point
         */
        configureAutowire: function()
        {

        },

        /**
         * @override
         */
        teardown: function()
        {
            var self = this;

            this.base();

            if (this.getGadgetId())
            {
                // remove all config listeners for this gadget
                Ratchet.Configuration.removeAllListeners({
                    "evaluator": "gadget",
                    "condition": {
                        "gadgetId": self.getGadgetId(),
                        "gadgetType": self.getGadgetType()
                    }
                });

                // remove our config from the configuration service
                this.releaseAllConfigs();
            }
        },

        renderTemplate: function(el, templateIdentifier, data, callback) {

            var self = this;

            //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] renderTemplate -> templateIdentifier: " + templateIdentifier);

            if (data && callback) {
                el.transform(templateIdentifier, data, function(el) {
                    callback(el);
                }, function(el, err) {

                    Ratchet.logError("Error transforming gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "]");
                    Ratchet.logError("Error Message: " + err.message);

                    callback(el, err);
                });
            } else {
                callback = data;
                el.transform(templateIdentifier, function(el) {
                    callback(el);
                }, function(el, err) {

                    Ratchet.logError("Error transforming gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "]");
                    Ratchet.logError("Error Message: " + err.message);

                });
            }
        },

        index: function(el, callback)
        {
            var self = this;

            var handleRender = function(el, model, cb)
            {
                self.doRender(el, model, function() {
                    cb();
                });
            };

            var model = JSON.parse(JSON.stringify(this.config()));
            handleRender(el, model, function() {

                if (callback)
                {
                    callback();
                }

            });
        },

        doRender: function(context, model, callback)
        {
            var self = this;

            //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] start render chain");

            self.beforePrepareModel(context, model, function() {

                // allows dynamic configuration to be loaded from a remote location
                self.loadDynamicConfiguration(context, model, function() {

                    //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call prepareModel()");
                    self.prepareModel(context, model, function () {
                        //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call substituteModelVariables()");

                        self.substituteModelVariables(context, model);

                        //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call filterModel()");
                        self.filterModel(model, function () {

                            //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call postFilterModel()");
                            self.postFilterModel(model, function () {

                                //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call render()");
                                self.render(context, model, function (el) {
                                    //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call beforeSwap()");
                                    self.beforeSwap(context, model, function () {
                                        //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call swap()");
                                        context.swap(function () {
                                            //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call afterSwap()");
                                            self.afterSwap($(self.ratchet().el)[0], model, context, function () {
                                                //Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] complete render chain");

                                                // nothing more to do

                                                if (callback)
                                                {
                                                    callback();
                                                }

                                            });
                                        });
                                    });
                                });
                            });

                        });
                    });
                });
            });
        },

        substituteModelVariables: function(el, model)
        {
            this.substituteVariables(el, model, model);
        },

        substituteVariables: function(el, model, obj)
        {
            Ratchet.substituteVariables(obj, model, el.tokens, el);
        },

        substitute: function(obj, replacementFunction)
        {
            Ratchet.substitute(obj, replacementFunction);
        },

        render: function(el, model, callback)
        {
            var self = this;

            self.renderTemplate(el, self.TEMPLATE, model, function(el, err) {
                callback(el);
            });
        },

        beforePrepareModel: function(el, model, callback)
        {
            callback();
        },

        loadDynamicConfiguration: function(el, model, callback)
        {
            callback();
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

            model.tokens = {};
            if (el.tokens)
            {
                for (var k in el.tokens)
                {
                    model.tokens[k] = el.tokens[k];
                }
            }

            model.route = el.route;
            model.uri = el.route.uri;
            model.method = el.route.method;

            callback();
        },

        /**
         * Provides an extension point for potentially permission and authority checking items on the model
         * ahead of applying the render.
         *
         * @param model
         * @param callback
         */
        filterModel: function(model, callback) {

            var self = this;

            if (self.customFilterModel)
            {
                self.customFilterModel(model, function() {
                    callback();
                });
            }
            else
            {
                callback();
            }
        },

        postFilterModel: function(model, callback) {
            callback();
        },

        beforeSwap: function(el, model, callback)
        {
            var self = this;

            // refresh observable name
            if (!model.observables.refresh)
            {
                model.observables.refresh = "refresh_" + self.getGadgetType() + "_" + self.getGadgetId();
            }

            // if there is a previous refresh handler, unbind it
            if (self._refreshHandler)
            {
                self.off(model.observables.refresh, self._refreshHandler);
                self.off("global_refresh", self._refreshHandler);
            }

            // bind a new one
            self._refreshHandler = self.refreshHandler(el);
            self.on(model.observables.refresh, self._refreshHandler);

            // global refresh handler
            self.on("global_refresh", self._refreshHandler);

            if (callback)
            {
                callback();
            }
        },

        afterSwap: function(el, model, originalContext, callback)
        {
            if (callback)
            {
                callback();
            }
        },

        refresh: function(model) {

            // forces refresh by clearing selected items
            var self = this;

            if (model && model.observables && model.observables.refresh)
            {
                self.trigger(model.observables.refresh);
            }
        },

        checkPermission: function(observableHolder, permissionedId, permissionId, item)
        {
            return false;
        },

        checkAuthority: function(observableHolder, permissionedId, authorityId, item)
        {
            return false;
        }

    });

    Ratchet.AbstractDashlet = Ratchet.AbstractDynamicGadget.extend({

        setup: function()
        {
            this.get(this.index);
        }

    });

});
