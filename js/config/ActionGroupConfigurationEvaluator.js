(function($) {

    return Ratchet.Configuration.register("action-group", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "type" property of the context matches the condition.
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

            var actionGroup = context["action-group"];

            // if actionGroup is a function, then evaluate it
            if (typeof(actionGroup) === "function") {
                actionGroup = actionGroup();
            }

            return (actionGroup === condition);
        }

    }));

})(jQuery);