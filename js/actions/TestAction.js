(function() {

    Ratchet.Actions.register("test", Ratchet.AbstractAction.extend({

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
            Ratchet.___test = data;

            var exists = false;
            if (data) {
                exists = true;
            }

            callback(null, {"success": exists});
        }

    }));

})();