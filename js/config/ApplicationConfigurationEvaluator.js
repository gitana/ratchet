(function() {

    return Ratchet.Configuration.register("application", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "application" property of the context matches the condition.
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

            if (context && context.application)
            {
                val = this.hasMatch(condition, context.application);
            }

            return val;
        }

    }));

})();