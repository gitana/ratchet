(function() {

    return Ratchet.Configuration.register("editor", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "editor" property of the context matches the condition.
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

            if (context && context.editor)
            {
                val = this.hasMatch(condition, context.editor);
            }

            return val;
        }

    }));

})();