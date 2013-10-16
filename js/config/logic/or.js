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

            // evaluate all conditions in the array
            var evaluation = false;
            for (var i = 0; i < conditions.length; i++)
            {
                evaluation = evaluation || engine.evaluate(engine, context, conditions[i]);
            }

            return evaluation;
        }

    }));

})();