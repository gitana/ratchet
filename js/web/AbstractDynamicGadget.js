(function($) {
    Ratchet.AbstractDynamicGadget = Ratchet.Gadget.extend(
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
                            "gadgets": {
                            }
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

            Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] renderTemplate -> templateIdentifier: " + templateIdentifier);

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

            Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] start render chain");
//            console.log("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] start render chain");

            Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call prepareModel()");
            this.prepareModel(context, model, function() {
                Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call substituteModelVariables()");
                self.substituteModelVariables(context, model, function() {
                    Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call render()");
                    self.render(context, model, function(el) {
                        Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call beforeSwap()");
                        self.beforeSwap(context, model, function() {
                            Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call swap()");
                            context.swap(function() {
                                Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] call afterSwap()");
                                self.afterSwap($(self.ratchet().el)[0], model, context, function() {
                                    Ratchet.logDebug("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] complete render chain");
//                                    console.log("Gadget [" + self.getGadgetType() + ", " + self.getGadgetId() + "] complete render chain");

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
        },

        substituteModelVariables: function(el, model, callback)
        {
            this.substituteVariables(el, model, model, function() {
                if (callback) {
                    callback();
                }
            });
        },

        substituteVariables: function(el, model, obj, callback)
        {
            var self = this;

            var replacementFunction = function(token)
            {
                var replacement = "";
                if (token.indexOf(".") == -1)
                {
                    // not dot-delimited

                    replacement = model[token];
                    if (!replacement)
                    {
                        replacement = self.observable(token).get();
                    }
                    if (!replacement && el && el.tokens)
                    {
                        replacement = el.tokens[token];
                    }
                }
                else
                {
                    // otherwise, it is dot-delimited...
                    var parts = token.split(".");
                    var first = parts.shift();

                    var initial = model[first];
                    if (!initial)
                    {
                        initial = self.observable(first).get();
                    }
                    if (!initial && el && el.tokens)
                    {
                        initial = el.tokens[first];
                    }
                    if (initial)
                    {
                        var remainderDotNotation = parts.join(".");

                        replacement = Ratchet.resolveDotNotation(initial, remainderDotNotation);
                    }
                }

                return replacement;
            };

            self.substitute(obj, replacementFunction, function() {
                if (callback) {
                    callback();
                }
            });
        },

        substitute: function(obj, replacementFunction, callback)
        {
            var self = this;

            // walk all variables in the model and see if we can perform ${} substitutions
            // substitution sources include el.tokens and observables

            var subst = function(objOrArray, level)
            {
                if (!objOrArray || level > 3)
                {
                    return;
                }

                if (Ratchet.isArray(objOrArray))
                {
                    for (var i = 0; i < objOrArray.length; i++)
                    {
                        if (Ratchet.isObject(objOrArray[i]) || Ratchet.isArray(objOrArray[i]))
                        {
                            subst(objOrArray[i], level + 1);
                        }
                    }
                }
                else if (Ratchet.isObject(objOrArray))
                {
                    for (var k in objOrArray)
                    {
                        if (objOrArray.hasOwnProperty(k))
                        {
                            if (Ratchet.isString(objOrArray[k]))
                            {
                                var text = objOrArray[k];

                                var CARS = ["${", "{"];

                                // substitute any tokens
                                var x = -1;
                                do
                                {
                                    var car = null;
                                    for (var a = 0; a < CARS.length; a++)
                                    {
                                        car = CARS[a];

                                        x = text.indexOf(car);
                                        if (x > -1)
                                        {
                                            break;
                                        }
                                    }

                                    if (x > -1)
                                    {
                                        var y = text.indexOf("}", x);
                                        if (y > -1)
                                        {
                                            var token = text.substring(x + car.length, y);

                                            var replacement = replacementFunction(token);
                                            if (!replacement) {
                                                replacement = "";
                                            }

                                            text = text.substring(0, x) + replacement + text.substring(y+1);
                                            objOrArray[k] = text;
                                        }
                                    }
                                }
                                while(x > -1);
                            }
                            else if (Ratchet.isObject(objOrArray[k]) || Ratchet.isArray(objOrArray[k]))
                            {
                                subst(objOrArray[k], level + 1);
                            }
                        }
                    }
                }
            };

            subst(obj, 0);

            if (callback) {
                callback();
            }
        },

        render: function(el, model, callback)
        {
            var self = this;

            self.renderTemplate(el, self.TEMPLATE, model, function(el, err) {
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

            model.tokens = {};
            if (el.tokens)
            {
                for (var k in el.tokens)
                {
                    model.tokens[k] = el.tokens[k];
                }
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
            if (callback)
            {
                callback();
            }
        }

    });

    Ratchet.AbstractDashlet = Ratchet.AbstractDynamicGadget.extend({

        setup: function()
        {
            this.get(this.index);
        }

    });

})(jQuery);
