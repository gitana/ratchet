define(["ratchet/ratchet", "base"], function(Ratchet, Base) {

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
         * @return {Object}
         */
        defaultConfiguration: function()
        {
            return {};
        },

        /**
         * EXTENSION POINT
         *
         * @param config
         * @param actionContext
         * @param callback signature is (err, data)
         * @return {Boolean}
         */
        execute: function(config, actionContext, callback)
        {
            callback();
        },

        browserLocale: function()
        {
            return "en_US";
        },

        msg: function(key)
        {
            var self = this;

            if (!self._messages) {
                self._messages = Ratchet.Messages.using(self.browserLocale(), Ratchet.Configuration);
            }

            var value = self._messages.message(key);
            if (!value) {
                value = self._messages.message("tokens." + key);
            }

            return value;
        }

    });

});