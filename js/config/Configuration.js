/*jshint -W004 */ // duplicate variables
(function($) {

    var defaultCompare = function(a, b) {
        if (a<b) return -1;
        if (a>b) return 1;
        return 0;
    };

    /**
     * CONFIGURATION SERVICE
     *
     * The configuration service provides a singleton service that manages configurations for a Ratchet application.
     * Configuration consists of zero or more configuration blocks that are evaluated at runtime based on the
     * context at the given time.  Upon retrieval, each configuration block is evaluated against the current context
     * and a dynamic configuration is assembled.
     *
     * The configuration service returns evaluated JSON which might look something like the following:
     *
     *  {
     *      "keyA": {
     *          "key1": "value1",
     *          "key2": ["value2"],
     *          "key3": {
     *              "key4": "value4"
     *          }
     *      },
     *      "keyB": {
     *          "key5": {
     *              "key6": [{
     *                  "key7": "value7"
     *              },{
     *                  "key8": "value8"
     *              }]
     *          }
     *      }
     *  }
     *
     *  And so forth.  In other words, the configuration is any arbitrary JSON structure.
     *
     *  Each module that loads can retrieve the configuration either using the singleton accessor
     *  (i.e. Ratchet.Configuration) or using the AMD/CommonJS approach.  The following works:
     *
     *      var config = Ratchet.Configuration;
     *      var config = require("ratchet/config");
     *
     *  Each module can then add its own configuration like this:
     *
     *      config.add({
     *          ... my config ...
     *      });
     *
     *  When used in the browser, the SCRIPT tag may contain a reference to a config file to load, i.e:
     *
     *      <script type="text/javascript" src="ratchet/config.js" data-config="config.json"></script>
     *
     *  When this tag evaluates, the file config.json will be loaded and the config will be applied to the singleton
     *  configuration registry.
     *
     *  You can retrieve the configuration at runtime by doing the following:
     *
     *      var json = config.eval(context);
     *
     *
     *
     *  CONFIGURATION BLOCKS
     *
     *  Each module can apply configuration blocks at any time.  A configuration block looks like this:
     *
     *      {
     *          "evaluator": "<configEvaluatorId>",         (optional)
     *          "condition": "<condition>",                 (optional)
     *          "replace":   <boolean>,                     (optional - default: false)
     *          "config": {
     *              ... the config ...
     *          }
     *      }
     *
     *  The fields are defined as thus:
     *
     *      evaluator       (optional) the id of the configuration evaluator to use to determine whether this block of
     *                      config should be included for the current context.  If not provided, then it assumes that
     *                      the block of config should be included.
     *
     *      condition       (optional) values that should be passed to the evaluator in addition to the context to help
     *                      determine whether the config block is valid for inclusion.
     *
     *      replace         (optional) whether the resulting config block should entirely override on any collisions.
     *                      By default, any collisions are merged (append or overwrite on a per record basis).
     *
     *      config          The JSON that you wish to append or replace into the configuration for this context.  This
     *                      can be any JSON structure that you wish.
     *
     *
     *
     *  CONFIGURATION EVALUATORS
     *
     *      TODO
     */

    var configClass = Base.extend({

        constructor: function()
        {
            this.base();

            // keys are generated at runtime
            this.blocks = {};

            // instances and classes for evaluators
            this.evaluatorInstances = {};
            this.evaluatorTypes = {};

            // subscription listeners
            this.subscriptions = {};
            this.subscriptionsCount = 0;

            this.generateBindingKey = function()
            {
                return Ratchet.toLinearForm.apply(this,arguments);
            };

            this.uniqueCount = function()
            {
                var x = 0;

                return function()
                {
                    return x++;
                };
            }();


            /**
             * Internal method for merging JSON.  Elements from the source are merged into the target.
             * The target is modified as the method runs.
             *
             * {
             *   "a": "a1",
             *   "b": "b1"
             * }
             *
             * {
             *   "a": "a2",
             *   "c": "c2"
             * }
             *
             * @param source
             * @param target
             * @param replaceFirstLevel
             */
            this.merge = function(source, target, replaceFirstLevel)
            {
                var isUndefined = function(thing)
                {
                    return (typeof(thing) === "undefined");
                };

                var isArray = function(thing)
                {
                    if (thing === true || thing === false || isUndefined(thing) || thing === null) {
                        return false;
                    }

                    if (typeof(thing) === "object")
                    {
                        if (thing.push && thing.slice) {
                            return true;
                        }
                    }

                    return false;
                };

                var isObject = function(thing)
                {
                    if (thing === true || thing === false || Ratchet.isUndefined(thing) || thing === null) {
                        return false;
                    }

                    if (isArray(thing)) {
                        return false;
                    }

                    if (typeof(thing) === "object")
                    {
                        return true;
                    }

                    return false;
                };

                var copyOf = function(thing)
                {
                    var copy = thing;

                    if (isArray(thing) || isObject(thing))
                    {
                        copy = JSON.parse(JSON.stringify(thing));
                    }

                    return copy;
                };

                var _doMerge = function(source, target, level, replaceFirstLevel)
                {
                    if (isArray(source))
                    {
                        if (isArray(target))
                        {
                            if (replaceFirstLevel && level === 1)
                            {
                                // remove everything from target array
                                target.splice(0, target.length);
                            }

                            // merge array elements
                            $.each(source, function(index) {

                                var added = false;

                                // if the thing we're copying into the array is an object and has a "key" field
                                // then perform a merge
                                // otherwise, simply push into the array

                                if (Ratchet.isObject(source[index]))
                                {
                                    if (!Ratchet.isUndefined(source[index].key))
                                    {
                                        // the source has a "key" field

                                        // now walk the target array elements and find a "key"
                                        // if the keys match, then merge
                                        for (var x = 0; x < target.length; x++)
                                        {
                                            if (Ratchet.isObject(target[x]))
                                            {
                                                if (target[x].key === source[index].key)
                                                {
                                                    target[x] = _doMerge(source[index], target[x], level+1, replaceFirstLevel);
                                                    added = true;
                                                }
                                            }
                                        }
                                    }
                                }

                                if (!added)
                                {
                                    target.push(copyOf(source[index]));
                                }

                            });
                        }
                        else
                        {
                            // something is already in the target that isn't an ARRAY
                            // should we overwrite?
                            // TODO
                            Ratchet.logWarn("Source is array but target is: " + typeof(target) + ", cannot merge");
                        }

                    }
                    else if (isObject(source))
                    {
                        if (isObject(target))
                        {
                            if (replaceFirstLevel && level === 1)
                            {
                                // remove everything from target
                                $.each(target, function(key) {
                                    delete target[key];
                                });
                            }

                            // merge object properties
                            $.each(source, function(key) {

                                if (isUndefined(target[key])) {
                                    target[key] = copyOf(source[key]);
                                } else {
                                    target[key] = _doMerge(source[key], target[key], level + 1, replaceFirstLevel);
                                }

                            });
                        }
                        else
                        {
                            // something is already in the target that isn't an OBJECT
                            // should we overwrite?
                            // TODO
                            Ratchet.logWarn("Source is object but target is: " + typeof(target) + ", cannot merge");
                        }

                    }
                    else
                    {
                        // otherwise, it's a scalar, always overwrite
                        target = copyOf(source);
                    }

                    return target;
                };

                _doMerge(source, target, 0, replaceFirstLevel);
            };
        },

        /**
         * Registers an evaluator with the configuration service.
         *
         * @param evaluatorId
         * @param evaluatorClass
         */
        register: function(evaluatorId, evaluatorClass)
        {
            this.evaluatorTypes[evaluatorId] = evaluatorClass;
            this.evaluatorInstances[evaluatorId] = new evaluatorClass(evaluatorId);

            return this.evaluatorTypes[evaluatorId];
        },

        /**
         * Applies the specific block of configuration into the configuration service.
         *
         * @param block
         * @return blockKey
         */
        add: function(block)
        {
            // SAFETY CHECK
            // if the block has an evaluator, make sure it is one that we know about
            if (block.evaluator && !this.evaluatorTypes[block.evaluator])
            {
                Ratchet.logError("Block added with evaluator type: " + block.evaluator + ", but this evaluator does not exist");
                throw new Error("Unknown configuration block evaluator: " + block.evaluator);
            }

            // generate a key for this block and register
            var count = this.uniqueCount();
            if (block.end) {
                count = count + 50000;
            }
            var blockKey = "b-" + Ratchet.padLeft(count, 5);
            this.blocks[blockKey] = block;

            // fire any listeners
            if (this.subscriptionsCount > 0)
            {
                var listenerConfig = {};
                if (typeof(block.evaluator) !== "undefined") {
                    listenerConfig.evaluator = block.evaluator;
                }
                if (typeof(block.condition) !== "undefined") {
                    listenerConfig.condition = block.condition;
                }
                this.triggerListeners(listenerConfig);
            }

            return blockKey;
        },

        /**
         * Removes a block of configuration by its block key.
         *
         * @param blockKey
         */
        release: function(blockKey)
        {
            var block = this.blocks[blockKey];
            if (block)
            {
                delete this.blocks[blockKey];

                // fire any listeners
                var listenerConfig = {};
                if (typeof(block.evaluator) !== "undefined") {
                    listenerConfig.evaluator = block.evaluator;
                }
                if (typeof(block.condition) !== "undefined") {
                    listenerConfig.condition = block.condition;
                }
                this.triggerListeners(listenerConfig);
            }
        },

        /**
         * Evaluates the current set of configuration blocks for the given context and hands back the
         * resulting JSON.
         *
         * @param context
         */
        evaluate: function(context)
        {
            var self = this;

            // figure out which blocks to apply
            var orderedBlockKeys = [];
            var keepers = {};
            for (var blockKey in this.blocks)
            {
                var block = this.blocks[blockKey];

                if (!block.evaluator)
                {
                    // nothing to evaluate, so keep
                    keepers[blockKey] = block;
                    orderedBlockKeys.push(blockKey);
                }
                else
                {
                    // fetch the evaluator
                    var evaluatorInstance = this.evaluatorInstances[block.evaluator];
                    if (!evaluatorInstance)
                    {
                        Ratchet.logWarn("Missing configuration evaluator: " + block.evaluator);
                    }
                    else
                    {
                        // evaluate
                        var valid = evaluatorInstance.evaluate(self, context, block.condition);
                        if (valid)
                        {
                            // valid, so keep it
                            keepers[blockKey] = block;
                            orderedBlockKeys.push(blockKey);
                        }
                    }
                }
            }

            //orderedBlockKeys.sort();

            // sort the order of the block keys according to the "order" property
            orderedBlockKeys.sort(function(a, b) {

                var block_a = keepers[a];
                var block_b = keepers[b];

                if (!block_a.order && !block_b.order) {
                    // fall back to key compare
                    return defaultCompare(a, b);
                }

                if (!block_a.order && block_b.order) {
                    // prefer block b
                    return 1;
                }

                if (block_a.order && !block_b.order) {
                    // prefer block a
                    return -1;
                }

                return defaultCompare(block_a.order, block_b.order);
            });

            /*
            var _blocks = [];
            for (var i = 0; i < orderedBlockKeys.length; i++) {
                _blocks.push(keepers[orderedBlockKeys[i]]);
            }
            console.log("ORDERED BLOCKS: " + JSON.stringify(_blocks, null, "  "));
            */


            /*
            // debugging
            Ratchet.logDebug("Configuration evaluate() for context: " + (context ? JSON.stringify(context) : "null"));
            for (var blockKey in keepers)
            {
                Ratchet.logDebug(" - keeper[" + blockKey + "]: " + JSON.stringify(keepers[blockKey]));
            }
            */

            // now apply
            /*
            Ratchet.logDebug("Applying Configuration");
            */
            var result = {};
            for (var i = 0; i < orderedBlockKeys.length; i++)
            {
                var blockKey = orderedBlockKeys[i];

                var block = keepers[blockKey];

                // config is assumed empty if not available
                var config = block.config;
                if (!config) {
                    config = {};
                }

                // whether to replace
                var replace = false;
                if (block.replace) {
                    replace = true;
                }

                /*
                Ratchet.logDebug("Applying block: " + blockKey + ": " + JSON.stringify(config));
                */

                self.merge(config, result, replace);
            }
            /*
            Ratchet.logDebug("Applied Configuration: " + JSON.stringify(result));
            */

            return result;
        },

        /**
         * Adds a listener to listen to changes in the configuration.
         *
         * @param config
         * @param listenerFunction
         */
        addListener: function(config, listenerFunction)
        {
            var self = this;

            var evaluator = config.evaluator;
            var condition = config.condition;

            var bindingKey = this.generateBindingKey(evaluator, condition);

            var subs = this.subscriptions[bindingKey];
            if (!subs)
            {
                subs = {};
                this.subscriptions[bindingKey] = subs;
            }

            var listenerId = listenerFunction._lfid;
            if (listenerId && subs[listenerId])
            {
                // the listener is already bound for the subscription
            }
            else
            {
                if (!listenerId)
                {
                    listenerId = Ratchet.generateListenerId();
                    listenerFunction._lfid = listenerId;
                }

                subs[listenerId] = listenerFunction;

                self.subscriptionsCount++;
            }
        },

        /**
         * Removes a listener.
         *
         * @param config
         * @param listenerFunctionOrId
         */
        removeListener: function(config, listenerFunctionOrId)
        {
            var self = this;

            var evaluator = config.evaluator;
            var condition = config.condition;

            var bindingKey = this.generateBindingKey(evaluator, condition);

            var listenerId = listenerFunctionOrId;
            if (Ratchet.isFunction(listenerFunctionOrId))
            {
                listenerId = listenerFunctionOrId._lfid;
            }
            if (!listenerId)
            {
                // nothing to do, this listener is not bound
            }
            else
            {
                var subs = this.subscriptions[bindingKey];
                if (subs && subs[listenerId])
                {
                    delete subs[listenerId];

                    self.subscriptionsCount--;
                }

                if (Ratchet.isEmptyObject(subs))
                {
                    delete this.subscriptions[bindingKey];
                }
            }
        },

        /**
         * Removes all listeners.
         *
         * @param config
         */
        removeAllListeners: function(config)
        {
            var self = this;

            var evaluator = config.evaluator;
            var condition = config.condition;

            var bindingKey = this.generateBindingKey(evaluator, condition);

            var subs = this.subscriptions[bindingKey];
            if (subs)
            {
                for (var listenerId in subs)
                {
                    delete subs[listenerId];

                    self.subscribersCount--;
                }
            }

            if (Ratchet.isEmptyObject(subs))
            {
                delete this.subscriptions[bindingKey];
            }
        },

        /**
         * Triggers listeners.
         *
         * @param config
         */
        triggerListeners: function(config)
        {
            var self = this;

            // bail out if no subscribers
            if (self.subscriptionsCount === 0)
            {
                return;
            }

            var evaluator = config.evaluator;
            var condition = config.condition;

            var bindingKey = this.generateBindingKey(evaluator, condition);

            var subs = this.subscriptions[bindingKey];
            if (subs)
            {
                for (var listenerId in subs)
                {
                    var listenerFunction = subs[listenerId];

                    // invoke listener
                    listenerFunction();
                }
            }
        },

        /**
         * Creates a clone of the configuration service.  This is useful for manipulating configuration that
         * will not end up part of the global registry.
         */
        clone: function(empty)
        {
            var x = new configClass();
            //x.evaluatorInstances = this.evaluatorInstances;
            //x.evaluatorTypes = this.evaluatorTypes;

            for (var instanceId in this.evaluatorInstances) {
                x.evaluatorInstances[instanceId] = this.evaluatorInstances[instanceId];
            }

            for (var typeId in this.evaluatorTypes) {
                x.evaluatorTypes[typeId] = this.evaluatorTypes[typeId];
            }

            x.subscriptions = [];
            x.subscriptionCount = 0;

            if (!empty)
            {
                for (var blockKey in this.blocks) {
                    x.blocks[blockKey] = JSON.parse(JSON.stringify(this.blocks[blockKey]));
                }

                for (var subscriptionId in this.subscriptions) {
                    x.subscriptions[subscriptionId] = this.subscriptions[subscriptionId];
                }
            }

            return x;
        }

    });

    Ratchet.Configuration = new configClass();

    // if we're running in a browser, we support specifying a config file via the "data-config" attribute on the
    // SCRIPT tag...
    var isBrowser = !!(typeof window !== 'undefined' && navigator && document);
    if (isBrowser)
    {
        var scripts = function()
        {
            var scripts = null;

            if (document)
            {
                scripts = document.getElementsByTagName('script');
            }

            return scripts;
        };

        var eachReverse = function(ary, func)
        {
            if (ary) {
                var i;
                for (i = ary.length - 1; i > -1; i -= 1) {
                    if (ary[i] && func(ary[i], i, ary)) {
                        break;
                    }
                }
            }
        };

        // we're in a browser, so we support specifying "data-config" attributes on the script tag
        eachReverse(scripts(), function (script) {

            // look for a data-config attribute
            var dataConfig = script.getAttribute("data-config");
            if (dataConfig)
            {
                console.log("Found data-config attribute on script tag, loading config");

                // found it, load config
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: dataConfig,
                    success: function(config) {
                        Ratchet.Configuration.apply(config);
                    },
                    error: function(err) {
                        alert(err.responseText);
                    }
                });
            }

        });
    }

    return Ratchet.Configuration;

})(jQuery);