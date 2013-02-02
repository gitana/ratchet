(function($) {

    return Ratchet.Configuration.register("gadget", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "gadget" property of the context matches the condition.
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

            var type = context.gadget;

            // if type is a function, then evaluate it
            if (typeof(context.gadget) === "function") {
                type = context.gadget();
            }

            return (type === condition);
        }

    }));

})(jQuery);