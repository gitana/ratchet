(function() {

    return Ratchet.Configuration.register("not", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Performs an NOT for a condition.
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

            return !engine.evaluate(engine, context, condition);
        }

    }));

})();