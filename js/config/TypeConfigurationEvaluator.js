(function() {

    return Ratchet.Configuration.register("type", Ratchet.AbstractConfigurationEvaluator.extend({

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

            var type = context.type;

            // if type is a function, then evaluate it
            if (typeof(context.type) === "function") {
                type = context.type();
            }

            return this.hasMatch(condition, type);
        }

    }));

})();