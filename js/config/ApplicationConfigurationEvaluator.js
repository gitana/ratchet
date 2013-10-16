(function() {

    return Ratchet.Configuration.register("application", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "application" property of the context matches the condition.
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

            var application = context.application;
            if (!application) {
                return false;
            }

            // if application is a function, then evaluate it
            if (typeof(context.application) === "function") {
                application = context.application();
            }

            return this.hasMatch(condition, application);
        }

    }));

})();