(function($)
{
    Ratchet.ObservableID = 0;
    Ratchet.Observable = Ratchet.Abstract.extend(
    {
        constructor: function()
        {
            var _this = this;

            this.base();

            Ratchet.ObservableID++;
            this.id = "observable-" + Ratchet.ObservableID;

            this.value = null;
            this.subscribers = {};

            // array that contains observable whose value is dependent on our value
            this.dependentOnUs = [];


            // privileged functions

            this.notifySubscribers = function()
            {
                _this.debug("Notifying subscribers for: " + this.id);

                $.each(this.subscribers, function(id, handler) {

                    _this.debug(" -> subscriber: " + id);

                    handler(_this.value);
                })
            };

            this.notifyDependents = function()
            {
                _this.debug("Notifying dependent observers for: " + this.id);

                $.each(this.dependentOnUs, function(index, observer) {

                    _this.debug(" -> dependent observer: " + observer.id);

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
            this.subscribers[id] = handler;
        },

        unsubscribe: function(id)
        {
            delete this.subscribers[id];
        },

        markDependentOnUs: function(observable)
        {
            this.dependentOnUs.push(observable);
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