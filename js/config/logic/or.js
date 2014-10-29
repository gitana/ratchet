(function() {

    return Ratchet.Configuration.register("or", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Performs an OR across a condition array.
         *
         * @param engine
         * @param context
         * @param condition
         *
         * @return {Boolean}
         */
        evaluate: function(engine, context, condition)
        {
            var val = false;

            if (context && condition)
            {
                // copy into an array
                var conditions = [];
                if (Ratchet.isArray(condition))
                {
                    conditions = condition;
                }
                else
                {
                    conditions.push(condition);
                }

                // assume false
                val = false;

                // child engine
                // add sub-conditions as new blocks
                for (var i = 0; i < conditions.length; i++)
                {
                    var childEvaluator = conditions[i].evaluator;
                    var childCondition = conditions[i].condition;

                    var evaluatorInstance = engine.evaluatorInstances[childEvaluator];
                    if (!evaluatorInstance)
                    {
                        Ratchet.logWarn("Missing configuration evaluator: " + childEvaluator);

                        val = false;
                        break;
                    }

                    // evaluate
                    var valid = evaluatorInstance.evaluate(engine, context, childCondition);
                    if (valid)
                    {
                        val = true;
                        break;
                    }
                }
            }

            return val;
        }

    }));

})();
