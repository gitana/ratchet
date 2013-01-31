(function($) {

    Ratchet.Actions.register("log", Ratchet.AbstractAction.extend({

        /**
         * Logs data to console.
         *
         * @param data
         * @param callback
         * @return {Boolean}
         */
        execute: function(data, callback)
        {
            console.log(JSON.stringify(data));

            callback();
        }

    }));

})(jQuery);