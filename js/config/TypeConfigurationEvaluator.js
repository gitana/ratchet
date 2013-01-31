(function($) {

    return Ratchet.Configuration.register("type", Ratchet.AbstractConfigurationEvaluator.extend({

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

            var type = context.type;

            // if type is a function, then evaluate it
            if (typeof(context.type) === "function") {
                type = context.type();
            }

            return (type === condition);
        }

    }));

})(jQuery);