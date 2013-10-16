(function() {

    return Ratchet.Configuration.register("action-group", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "type" property of the context matches the condition.
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

            var actionGroup = context["action-group"];

            // if actionGroup is a function, then evaluate it
            if (typeof(actionGroup) === "function") {
                actionGroup = actionGroup();
            }

            return this.hasMatch(condition, actionGroup);
        }


    }));

})();