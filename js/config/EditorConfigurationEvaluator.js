(function() {

    return Ratchet.Configuration.register("editor", Ratchet.AbstractConfigurationEvaluator.extend({

        /**
         * Checks whether the "editor" property of the context matches the condition.
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

            var editor = context.editor;
            if (!editor) {
                return false;
            }

            // if editor is a function, then evaluate it
            if (typeof(context.editor) === "function") {
                editor = context.editor();
            }

            return this.hasMatch(condition, editor);
        }

    }));

})();