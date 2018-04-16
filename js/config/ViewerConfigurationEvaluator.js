(function() {

    return Ratchet.Configuration.register("viewer", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "viewer" property of the context matches the condition.
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

            if (context && context.viewer)
            {
                val = this.hasMatch(condition, context.viewer);
            }

            return val;
        }

    }));

})();