(function() {

    return Ratchet.Configuration.register("locale", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "locale" property of the context matches the condition.
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

            var locale = context.locale;

            // if locale is a function, then evaluate it
            if (typeof(context.locale) === "function") {
                locale = context.locale();
            }

            return this.hasMatch(condition, locale);
        }

    }));

})();