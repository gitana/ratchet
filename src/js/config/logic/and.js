(function() {

    return Ratchet.Configuration.register("and", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Performs an AND across a condition array.
         *
         * @param engine
         * @param context
         * @param condition
         * @param observableHolder
         *
         * @return {Boolean}
         */
        evaluate: function(engine, context, condition, observableHolder)
        {
            var val = false;

            if (condition)
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

                // assume true
                val = true;

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
                    var valid = evaluatorInstance.evaluate(engine, context, childCondition, observableHolder);
                    if (!valid)
                    {
                        val = false;
                        break;
                    }
                }
            }

            return val;
        }

    }));

})();
