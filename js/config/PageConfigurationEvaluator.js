(function() {

    return Ratchet.Configuration.register("page", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "page" property of the context matches the condition.
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

            var page = context.page;

            // if page is a function, then evaluate it
            if (typeof(context.page) === "function") {
                page = context.page();
            }

            return this.hasMatch(condition, page);
        }

    }));

})();