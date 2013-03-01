(function() {

    var instances = {};
    var types = {};

    var actionsClass = Base.extend({

        constructor: function()
        {
            this.base();
        },

        /**
         * Registers an action class.
         *
         * @param actionId
         * @param action
         * @param configService optional config service to register against
         */
        register: function(actionId, actionClass, configService)
        {
            types[actionId] = actionClass;
            instances[actionId] = new actionClass(actionId);

            if (!configService)
            {
                configService = Ratchet.Configuration;
            }

            // see if the action has any default config that it'd like to provide
            var actionConfig = instances[actionId].defaultConfiguration();
            if (!actionConfig) {
                actionConfig = {};
            }

            if (!actionConfig.title) {
                actionConfig.title = actionId;
            }
            if (!actionConfig.iconClass) {
                actionConfig.iconClass = "icon-" + actionId;
            }

            // register default config
            var c = {
                "config": {
                    "actions": {}
                }
            };
            c.config.actions[actionId] = actionConfig;
            configService.add(c);

            return types[actionId];
        },

        /**
         * Unregisters an action.
         *
         * @param actionId
         */
        unregister: function(actionId)
        {
            delete types[actionId];
            delete instances[actionId];
        },

        /**
         * Find a single action instance by action id.
         *
         * @param actionId
         */
        findInstance: function(actionId)
        {
            return instances[actionId];
        },

        /**
         * Find a single action class by action id.
         *
         * @param actionId
         * @return {*}
         */
        findType: function(actionId)
        {
            return types[actionId];
        },

        /**
         * Executes the given action.
         *
         * @param actionId
         * @param actionConfig
         * @param actionContext
         * @param callback
         */
        execute: function(actionId, actionConfig, actionContext, callback)
        {
            var action = instances[actionId];
            if (!action)
            {
                Ratchet.logError("Cannot find action for action id: " + actionId);
                throw new Error("Cannot find action for action id: " + actionId);
            }

            action.execute(actionConfig, actionContext, callback);
        },

        /**
         * Retrieves all of the action configurations OR a subset (either a single or an array of action ids).
         *
         * @param actionId
         * @param configService (optional)
         */
        config: function(actionId, configService)
        {
            if (!configService)
            {
                configService = Ratchet.Configuration;
            }

            return configService.evaluate({
                "evaluator": "action",
                "condition": actionId
            });
        }

    });

    Ratchet.Actions = new actionsClass();

    return Ratchet.Actions;

})();
