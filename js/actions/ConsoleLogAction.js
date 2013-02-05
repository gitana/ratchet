(function() {

    Ratchet.Actions.register("log", Ratchet.AbstractAction.extend({

        /**
         * Logs data to console.
         *
         * @param config
         * @param data
         * @param callback
         * @return {Boolean}
         */
        execute: function(config, data, callback)
        {
            console.log(JSON.stringify(data));

            callback();
        }

    }));

})();