define(["./Configuration", "./AbstractConfigurationEvaluator"], function(Configuration, AbstractConfigurationEvaluator) {

    return Configuration.register("page", AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "page" property of the context matches the condition.
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

            if (context && context.page)
            {
                val = this.hasMatch(condition, context.page);
            }

            return val;
        }

    }));

});