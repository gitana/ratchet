(function() {

    return Ratchet.Configuration.register("action-group", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "type" property of the context matches the condition.
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

            if (context && context["action-group"])
            {
                val = this.hasMatch(condition, context["action-group"]);
            }

            return val;
        }


    }));

})();