define(["./Ratchet", "base"], function(Ratchet, Base) {

    var map = {};

    // event class
    var RatchetEvent = Base.extend({

        constructor: function(scope, id)
        {
            this.base();

            this.id = scope + "-" + id;
            this.subscribers = {};
        },

        /**
         * Registers a handler which acts as a subscriber.
         *
         * @param id
         * @param handler
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

        /**
         * Triggers the event with optional parameters.
         *
         * @param parameters
         */
        trigger: function(parameters)
        {
            $.each(this.subscribers, function(id, handler) {
                handler(parameters);
            });
        }

    });

    // grouping of events by scope
    var ScopedRatchetEvents = Base.extend({

        constructor: function(scope)
        {
            this.base();

            this.scope = scope;
            this.events = {};
        },

        event: function(id)
        {
            if (!this.events[id])
            {
                this.events[id] = new RatchetEvent(this.scope, id);
            }

            // hand back from map
            return this.events[id];
        },

        events: function()
        {
            return this.events;
        }

    });

    var getEvent = function(scope, id)
    {
        if (!map[scope]) {
            map[scope] = new ScopedRatchetEvents(scope);
        }

        return map[scope].event(id);
    };



    /////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // EVENT HELPER FUNCTIONS
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////

    Ratchet.Events = {};

    /**
     * Binds a single event handler for this ratchet.
     *
     * @param [String] scope an optional behavior scope
     * @param {String} eventId
     * @param {Function} eventHandler
     */
    Ratchet.Events.on = function()
    {
        var args = Ratchet.makeArray(arguments);

        var scope = null;
        var id = null;
        var handler = null;

        if (args.length == 2)
        {
            scope = "global";
            id = args.shift();
            handler = args.shift();
        }
        else
        {
            scope = args.shift();
            id = args.shift();
            handler = args.shift();
        }

        if (!id)
        {
            Ratchet.logError("Missing event id");
            return null;
        }

        // function identifier
        var handlerId = handler._hfid;
        if (!handlerId) {
            handlerId = Ratchet.generateEventHandlerId();
            handler._hfid = handlerId;
        }

        // wrap function into a closure
        var func = function(that) {
            return function() {
                return handler.apply(that, arguments);
            };
        }(this);
        func._hfid = handler._hfid;

        // retrieve the event
        var event = getEvent(scope, id);

        // tell the event to subscribe a handler
        event.subscribe(handlerId, func);

        return {
            "scope": scope,
            "id": id,
            "handlerId": handlerId
        };
    };

    /**
     * Binds a single event to be triggered only once.  After triggering, the handler is removed.
     *
     * @param [String] scope an optional behavior scope
     * @param {String} eventId
     * @param {Function} eventHandler
     */
    Ratchet.Events.once = function()
    {
        var self = this;

        var args = Ratchet.makeArray(arguments);

        var scope = null;
        var id = null;
        var handler = null;

        if (args.length == 2)
        {
            scope = "global";
            id = args.shift();
            handler = args.shift();
        }
        else
        {
            scope = args.shift();
            id = args.shift();
            handler = args.shift();
        }

        var _eventHandler = function(scope, id, handler)
        {
            return function(eventParameters)
            {
                var ret = handler(eventParameters);

                self.off(scope, id, this);

                return ret;
            };

        }(scope, id, handler);

        return this.on(scope, id, _eventHandler);
    };

    /**
     * Removes an event handler.
     *
     * @param [String] scope an optional behavior scope
     * @param {String} eventId
     * @param {Function|String} eventHandler (or handler id)
     */
    Ratchet.Events.off = function()
    {
        var args = Ratchet.makeArray(arguments);

        var scope = null;
        var id = null;
        var handlerOrId = null;

        if (args.length == 2)
        {
            scope = "global";
            id = args.shift();
            handlerOrId = args.shift();
        }
        else if (args.length == 3)
        {
            scope = args.shift();
            id = args.shift();
            handlerOrId = args.shift();
        }

        var handlerId = handlerOrId;
        if (Ratchet.isFunction(handlerId))
        {
            handlerId = handlerId._hfid;
        }

        // retrieve the event
        var event = getEvent(scope, id);

        // unsubscribe the handler
        event.unsubscribe(handlerId);

        return {
            "scope": scope,
            "id": id,
            "handlerId": handlerId
        };

    };

    /**
     * Triggers an event.
     *
     * @param [String] scope an optional behavior scope
     * @param {String} eventId
     * @param [Object] eventParameters
     */
    Ratchet.Events.trigger = function()
    {
        var args = Ratchet.makeArray(arguments);

        var scope = null;
        var id = null;
        var eventParameters = null;

        if (args.length == 1)
        {
            scope = "global";
            id = args.shift();
            eventParameters = {};
        }
        else if (args.length == 2)
        {
            scope = "global";
            id = args.shift();
            eventParameters = args.shift();
        }
        else if (args.length == 3)
        {
            scope = args.shift();
            id = args.shift();
            eventParameters = args.shift();
        }

        // retrieve the event
        var event = getEvent(scope, id);

        // trigger
        return event.trigger(eventParameters);
    };

});