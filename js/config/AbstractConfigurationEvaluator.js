(function() {

    Ratchet.AbstractConfigurationEvaluator = Base.extend({

        constructor: function(evaluatorId)
        {
            this.base();

            this.id = evaluatorId;
        },

        /**
         * EXTENSION POINT
         *
         * @param engine
         * @param context
         * @param condition (optional)
         * @param observableHolder (optional)
         *
         * @return {Boolean}
         */
        evaluate: function(engine, context, condition, observableHolder)
        {
            return true;
        },

        /**
         * Determines whether the text "patternString" exists inside of the text "text'.
         *
         * @param text
         * @param patternString
         * @return {*}
         */
        hasMatch: function(text, patternString)
        {
            // eval function if pattern string is func
            if (typeof(patternString) === "function")
            {
                patternString = patternString();
            }

            var val = false;

            if (text === patternString)
            {
                val = true;
            }
            else if (patternString === "*")
            {
                val = true;
            }

            return val;
        }

    });


})();