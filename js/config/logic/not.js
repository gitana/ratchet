(function() {

    return Ratchet.Configuration.register("not", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Performs a NOT for a condition.
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
                var childEvaluator = condition.evaluator;
                var childCondition = condition.condition;

                var evaluatorInstance = engine.evaluatorInstances[childEvaluator];
                if (!evaluatorInstance)
                {
                    Ratchet.logWarn("Missing configuration evaluator: " + childEvaluator);

                    val = false;
                }
                else
                {
                    // evaluate
                    var valid = evaluatorInstance.evaluate(engine, context, childCondition);
                    if (!valid)
                    {
                        val = true;
                    }
                }
            }

            return val;
        }

    }));

})();
