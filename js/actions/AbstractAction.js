(function() {

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
                if (Ratchet.isArray(data)) {
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
         * @param config
         * @param data
         * @param callback signature is (err, data)
         * @return {Boolean}
         */
        execute: function(config, data, callback)
        {
            callback();
        }

    });

})();