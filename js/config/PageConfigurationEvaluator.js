(function() {

    return Ratchet.Configuration.register("page", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "page" property of the context matches the condition.
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

            if (context && context.page)
            {
                val = this.hasMatch(condition, context.page);
            }

            return val;
        }

    }));

})();