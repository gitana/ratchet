define(["./Actions", "./AbstractAction", "ratchet/ratchet"], function(Actions, AbstractAction, Ratchet) {

    return Actions.register("test", AbstractAction.extend({

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