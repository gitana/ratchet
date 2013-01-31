(function($) {

    Ratchet.AbstractConfigurationEvaluator = Base.extend({

        constructor: function(evaluatorId)
        {
            this.base();

            this.id = evaluatorId;
        },

        /**
         * EXTENSION POINT
         *
         * @param context
         * @param condition (optional)
         *
         * @return {Boolean}
         */
        evaluate: function(context, condition)
        {
            return true;
        }

    });


})(jQuery);