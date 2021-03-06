/*jshint -W004 */ // duplicate variables
(function($) {

    var defaultCompare = function(a, b)
    {
        if (a < b)
        {
            return -1;
        }

        if (a > b)
        {
            return 1;
        }

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
            this.blockKeys = [];

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

                return function(inc, val)
                {
                    if ((typeof(inc) !== "undefined") && inc !== null)
                    {
                        x += inc;
                    }

                    if ((typeof(val) !== "undefined") && val !== null)
                    {
                        x = val;
                    }

                    return x;
                };
            }();


            /**
             * Internal method for merging JSON.  Elements from the source are merged into the target.
             * The target is modified as the method runs.
             *
             * @param source
             * @param target
             * @param replaceFirstLevel
             * @param noRemove
             */
            this.merge = function(source, target, replaceFirstLevel, noRemove)
            {
                var self = this;

                var isUndefined = Ratchet.isUndefined;

                var isArray = Ratchet.isArray;

                var isObject = Ratchet.isObject;

                var copyOf = function(thing)
                {
                    var copy = null;

                    if (isArray(thing) || isObject(thing))
                    {
                        copy = JSON.parse(JSON.stringify(thing));
                    }
                    else
                    {
                        copy = Ratchet.copyOf(thing);
                    }

                    return copy;
                };

                var indexInArray = function(array, object) {

                    for (var i = 0; i < array.length; i++) {

                        if (Ratchet.isString(object)) {

                            if (Ratchet.isString(array[i]) && array[i] == object)
                            {
                                return i;
                            }

                        } else if (Ratchet.isObject(object)) {

                            if (object._key && array[i]._key) {
                                if (array[i]._key == object._key) {
                                    return i;
                                }
                            }
                            if (object.key && array[i].key) {
                                if (array[i].key == object.key) {
                                    return i;
                                }
                            }
                            if (object.action && array[i].action) {
                                if (array[i].action == object.action) {
                                    return i;
                                }
                            }
                        }
                    }

                    return -1;
                };

                var _doMerge = function(source, target, level, replaceFirstLevel, noRemove)
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

                                var x = indexInArray(target, source[index]);
                                if (x === -1)
                                {
                                    if (!source[index].remove || source[index].remove && noRemove) {
                                        target.push(copyOf(source[index]));
                                    }
                                }
                                else
                                {
                                    // we found a possible match

                                    if (source[index].remove || target[x].remove)
                                    {
                                        if (noRemove)
                                        {
                                            // skip

                                            // just make sure target is marked
                                            target[x].remove = true;
                                        }
                                        else
                                        {
                                            target.splice(x, 1);
                                        }
                                    }
                                    else if (target[x].lock)
                                    {
                                        // target is locked, do not merge
                                    }
                                    else
                                    {
                                        target[x] = _doMerge(source[index], target[x], level+1, replaceFirstLevel, noRemove);
                                    }
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

                            // walk object properties and merge
                            $.each(source, function(key) {

                                if (isUndefined(target[key]))
                                {
                                    target[key] = copyOf(source[key]);
                                }
                                else if (isObject(target[key]) && target[key].lock)
                                {
                                    // skip since target is locked
                                }
                                else
                                {
                                    target[key] = _doMerge(source[key], target[key], level + 1, replaceFirstLevel, noRemove);
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

                _doMerge(source, target, 0, replaceFirstLevel, noRemove);
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
                return;
            }

            // generate a key for this block and register

            // increment block counter by 1
            var count = this.uniqueCount(1);
            if (block.end) {
                count = count + 50000;
            }
            var blockKey = "b-" + Ratchet.padLeft(count, 5);
            this.blocks[blockKey] = block;
            this.blockKeys.push(blockKey);

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

            // remove from block keys
            var i = this.blockKeys.indexOf(blockKey);
            if (i > -1) {
                this.blockKeys.splice(i, 1);
            }
        },

        /**
         * Reads a block of configuration by it's block key.
         *
         * @param blockKey
         * @returns {*}
         */
        read: function(blockKey)
        {
            return this.blocks[blockKey];
        },

        /**
         * Retrieves a list of block keys.
         */
        listKeys: function()
        {
            return this.blockKeys;
        },

        /**
         * Evaluates the current set of configuration blocks for the given context and hands back the
         * resulting JSON.
         *
         * @param context
         * @param noRemove
         * @param observableHolder
         */
        evaluate: function(context, noRemove, observableHolder)
        {
            var self = this;

            if (!observableHolder && window.Ratchet) {
                observableHolder = window.Ratchet;
            }

            // figure out which blocks to apply
            var orderedBlockKeys = [];
            var keepers = {};
            for (var z = 0; z < this.blockKeys.length; z++)
            {
                var blockKey = this.blockKeys[z];

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
                        var valid = evaluatorInstance.evaluate(self, context, block.condition, observableHolder);
                        if (valid)
                        {
                            // valid, so keep it
                            keepers[blockKey] = block;
                            orderedBlockKeys.push(blockKey);
                        }
                    }
                }
            }

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
                    return -1;
                }

                if (block_a.order && !block_b.order) {
                    // prefer block a
                    return 1;
                }

                return defaultCompare(block_a.order, block_b.order);
            });

            // now apply
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

                self.merge(config, result, replace, noRemove);
            }

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

                    self.subscriptionsCount--;
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

            for (var instanceId in this.evaluatorInstances)
            {
                x.evaluatorInstances[instanceId] = this.evaluatorInstances[instanceId];
            }

            for (var typeId in this.evaluatorTypes) {
                x.evaluatorTypes[typeId] = this.evaluatorTypes[typeId];
            }

            x.subscriptions = {};
            x.subscriptionsCount = 0;

            if (!empty)
            {
                for (var z = 0; z < this.blockKeys.length; z++)
                {
                    var blockKey = this.blockKeys[z];

                    x.blocks[blockKey] = JSON.parse(JSON.stringify(this.blocks[blockKey]));
                }

                x.blockKeys = JSON.parse(JSON.stringify(this.blockKeys));

                for (var subscriptionId in this.subscriptions)
                {
                    x.subscriptions[subscriptionId] = this.subscriptions[subscriptionId];

                    // increase subscriptions count
                    for (var listenerId in x.subscriptions[subscriptionId]) {
                        x.subscriptionsCount++;
                    }
                }

                // copy the block counter
                x.uniqueCount(null, this.uniqueCount());
            }

            return x;
        },

        /**
         * Empties all the blocks and subscriptions for this configuration.
         */
        empty: function()
        {
            this.blocks = {};
            this.blockKeys = [];

            // reset block counter
            this.uniqueCount(null, 0);

            this.subscriptions = {};
            this.subscriptionsCount = 0;
        },

        /**
         * Reloads this configuration instance with a copy of the contents of another.
         *
         * @param configuration the configuration instance to import from
         */
        reload: function(configuration)
        {
            // keys are generated at runtime
            this.blocks = {};
            this.blockKeys = [];

            // reset block counter
            this.uniqueCount(null, 0);

            // instances and classes for evaluators
            this.evaluatorInstances = {};
            this.evaluatorTypes = {};

            // subscription listeners
            this.subscriptions = {};
            this.subscriptionsCount = 0;

            this.accumulate(configuration);
        },

        /**
         * Takes the contents of the given configuration and adds it into our config.
         *
         * @param configuration
         */
        accumulate: function(configuration)
        {
            for (var instanceId in configuration.evaluatorInstances) {
                this.evaluatorInstances[instanceId] = configuration.evaluatorInstances[instanceId];
            }

            for (var typeId in configuration.evaluatorTypes) {
                this.evaluatorTypes[typeId] = configuration.evaluatorTypes[typeId];
            }

            for (var z = 0; z < configuration.blockKeys.length; z++)
            {
                var blockKey = configuration.blockKeys[z];

                this.add(JSON.parse(JSON.stringify(configuration.blocks[blockKey])));
            }

            for (var subscriptionId in configuration.subscriptions) {
                this.subscriptions[subscriptionId] = configuration.subscriptions[subscriptionId];

                // increase subscriptions count
                for (var listenerId in this.subscriptions[subscriptionId]) {
                    this.subscriptionsCount++;
                }
            }
        }

    });

    Ratchet.Configuration = new configClass();

    return Ratchet.Configuration;

})(jQuery);