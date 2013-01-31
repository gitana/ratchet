(function($) {

    Ratchet.Actions.register("test", Ratchet.AbstractAction.extend({

        /**
         * Logs data to console.
         *
         * @param data
         * @param callback
         * @return {Boolean}
         */
        execute: function(data, callback)
        {
            Ratchet.___test = data;

            callback();
        }

    }));

})(jQuery);