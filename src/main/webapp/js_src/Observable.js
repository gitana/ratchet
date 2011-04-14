(function($)
{
    Ratchet.Observable = Base.extend(
    {
        constructor: function(scope, id)
        {
            var _this = this;

            this.base();

            this.id = scope + "-" + id;

            //Ratchet.debug("created: " + this.id);

            this.value = null;
            this.subscribers = {};

            // array that contains observable whose value is dependent on our value
            this.dependentOnUs = {};


            // privileged functions

            this.notifySubscribers = function()
            {
                var count = 0;
                $.each(this.subscribers, function() {
                    count++;
                });
                Ratchet.debug("Notifying " + count + " subscribers for: " + this.id);

                $.each(this.subscribers, function(id, handler) {
                    handler(_this.value);
                })
            };

            this.notifyDependents = function()
            {
                var count = 0;
                $.each(this.dependentOnUs, function() {
                    count++;
                });
                Ratchet.debug("Notifying " + count + " dependent observers for: " + this.id);

                $.each(this.dependentOnUs, function(key, observer) {
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
                Ratchet.debug("SUBSCRIBE: " + id + " subscribed to observable: " + this.id);
            }
        },

        unsubscribe: function(id)
        {
            delete this.subscribers[id];
        },

        isSubscribed: function(id)
        {
            return this.subscribers[id];
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

        set: function(value)
        {
            this.value = value;

            // notify all dependents (observers that depend on our value)
            this.notifyDependents();

            // notify all subscribers of the updated value
            this.notifySubscribers();
        },

        get: function()
        {
            var v = this.value;
            if (!v)
            {
                v = "";
            }

            return v;
        }

    });

})(jQuery);