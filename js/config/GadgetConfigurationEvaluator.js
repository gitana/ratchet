(function() {

    return Ratchet.Configuration.register("gadget", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "gadget" id and type of the context matches the condition.
         *
         * @param context
         * @param condition
         *
         * @return {Boolean}
         */
        evaluate: function(context, condition)
        {
            if (!context) {
                return false;
            }

            var gadgetType = context.gadgetType;
            var gadgetId = context.gadgetId;
            if (!gadgetId) {
                gadgetId = context.gadget;
            }

            return (context.gadgetType == condition.gadgetType && context.gadgetId == condition.gadgetId);
        }

    }));

})();