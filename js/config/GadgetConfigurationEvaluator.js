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

            var gadgetTypeId = context.gadgetType;
            if (!gadgetTypeId) {
                gadgetTypeId = context.gadgetTypeId;
            }
            var gadgetId = context.gadgetId;
            if (!gadgetId) {
                gadgetId = context.gadget;
            }

            var m1 = this.hasMatch(condition.gadgetType, gadgetTypeId);
            var m2 = this.hasMatch(condition.gadget, gadgetId);

            // if only one of the conditions is specified, then filter only on that
            var b = true;
            if (gadgetTypeId) {
                b = b & m1;
            }
            if (gadgetId) {
                b = b & m2;
            }

            // however, if neither are specified, then false
            if (!gadgetTypeId && !gadgetId) {
                b = false;
            }

            return b;
        }

    }));

})();