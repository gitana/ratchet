(function($) {

    Ratchet.AbstractAction = Base.extend({

        constructor: function(actionId)
        {
            this.base();

            this.id = actionId;

            /**
             * Converts a single item to an array (i.e. item -> [item])
             * If already an array, simple hands back the array.
             *
             * @param data
             */
            this.toArray = function(data)
            {
                var array = [];
                if (typeof(data) == "array") {
                    array = data;
                } else {
                    array.push(data);
                }

                return array;
            };
        },

        /**
         * EXTENSION POINT
         *
         * @param data
         * @param callback
         * @return {Boolean}
         */
        execute: function(data, callback)
        {
            callback();
        }

    });

})(jQuery);