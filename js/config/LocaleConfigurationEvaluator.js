(function() {

    return Ratchet.Configuration.register("locale", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "locale" property of the context matches the condition.
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

            if (context && context.locale)
            {
                val = this.hasMatch(condition, context.locale);
            }

            return val;
        }

    }));

})();