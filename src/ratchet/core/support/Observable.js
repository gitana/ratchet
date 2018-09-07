define(["./Ratchet", "base"], function(Ratchet, Base) {

    Ratchet.Observable = Base.extend(
    {
        constructor: function(scope, id)
        {
            var _this = this;

            this.base();

            this.id = scope + "-" + id;

            this.value = null;
            this.subscribers = {};

            // array that contains observable whose value is dependent on our value
            this.dependentOnUs = {};


            // privileged functions

            this.notifySubscribers = function(prior)
            {
                var _this = this;

                $.each(this.subscribers, function(id, handler) {
                    //Ratchet.debug("Notifying subscriber: " + id + " of update to: " + _this.id);
                    handler(_this.value, prior);
                });
            };

            this.notifyDependents = function(prior)
            {
                $.each(this.dependentOnUs, function(key, observer) {
                    //Ratchet.debug("Notifying dependent:  " + key + " of update to: " + _this.id);
                    observer.onDependencyChange();
                });
            };

            // assume null value function
            this.valueFunction = null;
        },

        setValueFunction: function(valueFunction)
        {
            this.valueFunction = valueFunction;
            this.onDependencyChange();
        },

        /**
         * Registers a handler which acts as a subscriber.  When this observable value changes,
         * the handler method is raised.
         *
         * @param f
         */
        subscribe: function(id, handler)
        {
            if (!this.isSubscribed(id))
            {
                this.subscribers[id] = handler;
            }
        },

        unsubscribe: function(id)
        {
            delete this.subscribers[id];
        },

        isSubscribed: function(id)
        {
            return (this.subscribers[id] ? true: false);
        },

        markDependentOnUs: function(observable)
        {
            this.dependentOnUs[observable.id] = observable;
        },

        /**
         * Fired when one of our dependents has changed its value.
         */
        onDependencyChange: function()
        {
            var prior = this.get();

            // if we have a value calculation function, fire it
            if (this.valueFunction)
            {
                var current = this.valueFunction();

                // if the value changed, notify
                if (prior != current)
                {
                    this.set(current);
                }
            }
        },

        set: function(value, silent)
        {
            var prior = this.value;
            this.value = value;

            // notify all dependents (observers that depend on our value)
            this.notifyDependents(prior);

            // notify all subscribers of the updated value
            if (!silent) {
                this.notifySubscribers(prior);
            }
        },

        get: function(_default)
        {
            var v = this.value;
            if (typeof(v) === "undefined")
            {
                v = _default;
            }
            return v;
        },

        clear: function(silent)
        {
            var prior = this.value;
            delete this.value;

            // notify all dependents (observers that depend on our value)
            this.notifyDependents(prior);

            // notify all subscribers of the updated value
            if (!silent) {
                this.notifySubscribers(prior);
            }
        }

    });

});