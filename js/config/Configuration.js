(function($) {

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
     *      var config = require("ratchet-config");
     *
     *  Each module can then add its own configuration like this:
     *
     *      config.add({
     *          ... my config ...
     *      });
     *
     *  When used in the browser, the SCRIPT tag may contain a reference to a config file to load, i.e:
     *
     *      <script type="text/javascript" src="ratchet-config.js" data-config="config.json"></script>
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
            var self = this;

            this.base();

            this.blocks = [];
            this.evaluatorInstances = {};
            this.evaluatorTypes = {};

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
                    return (typeof(thing) === "object") && (typeof(thing.length) !== "undefined");
                };

                var isObject = function(thing)
                {
                    return (typeof(thing) === "object") && (typeof(thing.length) === "undefined");
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

                var merge = function(source, target, level, replaceFirstLevel)
                {
                    if (isArray(source))
                    {
                        if (isArray(target))
                        {
                            if (replaceFirstLevel && level == 1)
                            {
                                // remove everything from target array
                                target.splice(0, target.length);
                                //target.length = 0;
                            }

                            // merge array elements
                            $.each(source, function(index) {
                                target.push(copyOf(source[index]));
                            });
                        }
                        else
                        {
                            // something is already in the target that isn't an ARRAY
                            // should we overwrite?
                            // TODO
                            console.log("Source is array but target is: " + typeof(target) + ", cannot merge");
                        }

                    }
                    else if (isObject(source))
                    {
                        if (isObject(target))
                        {
                            if (replaceFirstLevel && level == 1)
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
                                    target[key] = merge(source[key], target[key], level+1, replaceFirstLevel);
                                }

                            });
                        }
                        else
                        {
                            // something is already in the target that isn't an OBJECT
                            // should we overwrite?
                            // TODO
                            console.log("Source is object but target is: " + typeof(target) + ", cannot merge");
                        }

                    }
                    else
                    {
                        // otherwise, it's a scalar, always overwrite
                        target = copyOf(source);
                    }

                    return target;
                };

                merge(source, target, 0, replaceFirstLevel)
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
         */
        add: function(block)
        {
            // TODO: validate that the block is correctly formatted and structured
            // TODO: if we find some kind of issue, we should report it right away and exclude it from our array

            this.blocks.push(block);
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

            var result = {};

            for (var i = 0; i < this.blocks.length; i++)
            {
                var block = this.blocks[i];

                // condition is optional
                var condition = block.condition;

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

                var apply = function(source, target, replace)
                {
                    self.merge(source, target, replace)
                };

                if (!block.evaluator)
                {
                    // no evaluator, so assume okay and merge
                    apply(config, result, replace);
                }
                else
                {
                    // fetch the evaluator
                    var evaluatorInstance = this.evaluatorInstances[block.evaluator];
                    if (!evaluatorInstance)
                    {
                        throw new Error("Missing evaluator: " + block.evaluator);
                        return;
                    }

                    // evaluate
                    var valid = evaluatorInstance.evaluate(context, condition);
                    if (valid)
                    {
                        // looks good, so merge
                        apply(config, result, replace);
                    }
                }
            }

            return result;
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