(function($) {

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
         */
        register: function(actionId, actionClass)
        {
            types[actionId] = actionClass;
            instances[actionId] = new actionClass(actionId);

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
         * @param data
         * @param callback
         */
        execute: function(actionId, actionConfig, data, callback)
        {
            var action = instances[actionId];
            if (!action)
            {
                throw new Error("Cannot find action for action id: " + actionId);
            }

            action.execute(actionConfig, data, callback);
        }

    });

    Ratchet.Actions = new actionsClass();

    return Ratchet.Actions;

})(jQuery);
