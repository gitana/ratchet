(function() {

    return Ratchet.Configuration.register("and", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Performs an AND across a condition array.
         *
         * @param engine
         * @param context
         * @param condition
         *
         * @return {Boolean}
         */
        evaluate: function(engine, context, condition)
        {
            if (!context) {
                return false;
            }

            if (!condition) {
                return false;
            }

            // copy into an array
            var conditions = [];
            if (Ratchet.isArray(condition))
            {
                for (var i = 0; i < condition.length; i++)
                {
                    conditions.push(condition[i]);
                }
            }
            else
            {
                conditions.push(condition);
            }

            // child engine
            // add sub-conditions as new blocks
            var childEngine = engine.clone(true);
            for (var i = 0; i < conditions.length; i++)
            {
                var block = {
                    "evaluator": conditions[i].evaluator,
                    "condition": conditions[i].condition,
                    "config": {
                        "results": ["true"]
                    }
                };
                childEngine.add(block);
            }

            // evaluate
            var childConfig = childEngine.evaluate(context);

            // valid if size of array == size of conditions
            return (childConfig && childConfig.results && childConfig.results.length == conditions.length);
        }

    }));

})();
