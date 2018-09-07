define(["ratchet/ratchet", "./AbstractAction"], function(Ratchet, AbstractAction) {

    return Ratchet.Actions.register("test", AbstractAction.extend({

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
            Ratchet.___test = actionContext;

            callback({
                "message": "hello"
            }, {
                "success": true
            });
        }

    }));

});