(function() {

    return Ratchet.Configuration.register("viewer", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "viewer" property of the context matches the condition.
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

            var viewer = context.viewer;
            if (!viewer) {
                return false;
            }

            // if viewer is a function, then evaluate it
            if (typeof(context.viewer) === "function") {
                viewer = context.viewer();
            }

            return this.hasMatch(condition, viewer);
        }

    }));

})();