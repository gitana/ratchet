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
         *
         * @return {Boolean}
         */
        evaluate: function(engine, context, condition)
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
            if (text == patternString)
            {
                return true;
            }

            if (patternString == "*")
            {
                return true;
            }

            return false;

            /*
            if (!text) {
                return false;
            }

            if (!patternString) {
                return false;
            }

            // convert t from wildcard format to regexp
            var regex = Ratchet.wildcardToRegExp(patternString);

            var arr = text.match(regex);
            return (arr && arr.length > 0);
            */
        }

    });


})();