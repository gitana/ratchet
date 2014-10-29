(function() {

    return Ratchet.Configuration.register("application", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "application" property of the context matches the condition.
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

            if (context && context.application)
            {
                val = this.hasMatch(condition, context.application);
            }

            return val;
        }

    }));

})();