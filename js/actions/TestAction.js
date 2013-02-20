(function() {

    Ratchet.Actions.register("test", Ratchet.AbstractAction.extend({

        /**
         * Logs data to console.
         *
         * @param config
         * @param actionContext
         * @param callback
         * @return {Boolean}
         */
        execute: function(config, actionContext, callback)
        {
            var data = actionContext.data;

            Ratchet.___test = data;

            var exists = false;
            if (data) {
                exists = true;
            }

            callback(null, {"success": exists});
        }

    }));

})();