(function($)
{
    Ratchet.Gadget = Base.extend(
    {
        // either (type, _ratchet)
        // or (type, _ratchet, id)
        constructor: function(type, _ratchet, _gadgetIdentifier)
        {
            this.base();

            var _this = this;

            this.type = type;

            // the gadget id assumed to be null until configure() is called
            // at which point Ratchet will have determined that this gadget instance is to take control of
            // the dispatching
            this.id = null;

            // helper function to make sure that any dispatch functions first init the gadget state using the gadget
            // id if it is provided
            this.wrapConfigurable = function(array)
            {
                for (var i = 0; i < array.length; i++)
                {
                    var a = array[i];
                    if (Ratchet.isFunction(a))
                    {
                        // new dispatch function
                        // calls configure() before calling function itself
                        array[i] = function(dispatchHandlerFunction) {

                            return function() {

                                // call configure first to claim the gadget identifier
                                _this.configure(_gadgetIdentifier);

                                // now call the actual dispatch handler
                                dispatchHandlerFunction.apply(_this, arguments);
                            };

                        }(a);

                        break;
                    }
                }
            };

            // keep track of any subscriptions this gadget creates
            this.subscriptions = {};

            // keep track of any event handlers this gadget registers
            this.eventHandlers = {};

            // privileged methods

            this.route = function(uri, method, viewHandler, controllerHandler)
            {
                // special case - "viewHandler" can be a String which identifies a template to execute!
                if (Ratchet.isString(viewHandler))
                {
                    var view = viewHandler;
                    viewHandler = function(context, model)
                    {
                        _this.renderTemplate.call(_this, context, model, view);
                    };
                }
                _ratchet.route(this, uri, method, viewHandler, controllerHandler);
            };

            this.ratchet = function()
            {
                return _ratchet;
            };

            this.topRatchet = function()
            {
                var ratchet = this.ratchet();
                while (ratchet.parent)
                {
                    ratchet = ratchet.parent;
                }

                return ratchet;
            };

            this.getGadgetId = function()
            {
                return this.id;
            };

            this.getGadgetType = function()
            {
                return this.type;
            };

        },

        app: function()
        {
            return this.topRatchet();
        },

        /**
         * @extension_point
         *
         * This gets called so that the gadget can bind to any routes that it wants to claim.  The routes should
         * be claimed by making calls to:
         *
         *    this.get()
         *    this.put()
         *    this.post()
         *    this.del()
         *
         * For example:
         *
         *    this.get("/products", this.products);
         *
         * This would tell Ratchet that when the #/products route is encountered, this gadget should handle the
         * processing for any gadgets of this gadget type.
         *
         * Any extensions of this method should make sure to call this.base() to ensure that base setup is
         * achieved ahead of custom setup.
         */
        setup: function()
        {
        },

        /**
         * @extension_point
         *
         * This gets called when Ratchet has decided to dispatch to a new URI.  Before dispatching, any existing
         * gadgets are dismantled and destroyed.
         *
         * Ratchet will have determined that this gadget is to be destroyed.  This method is responsible for
         * releasing and cleaning up any data that this gadget instance may be holding on to.
         */
        teardown: function()
        {
            // release any subscriptions this gadget might have
            this.unsubscribeAll();

            // release any event handlers this gadget might have
            this.offAll();
        },

        /**
         * @extension_point
         *
         * This gets called when Ratchet has decided that this gadget instance is going to be the one responsible
         * for handling the rendering.  At that point, Ratchet passes in the gadgetId that this instance should
         * assume.
         *
         * The gadget might load or setup configuration or do anything else that it would like ahead of dispatching.
         * The intention is to support late configuration.  All gadget instance-level configuration should happen
         * within this method.
         *
         * In addition, it should be the case that any configuration applied during the call to configure() should
         * be destroyed when teardown() gets called.
         *
         * @param gadgetIdentifier
         */
        configure: function(gadgetIdentifier)
        {
            // claim the gadget id
            this.id = gadgetIdentifier;
        },


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // OBSERVABLES
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        subscribe: function()
        {
            var descriptor = Ratchet.subscribe.apply(this, arguments);

            var subscriptionKey = Ratchet.toLinearForm(descriptor);

            this.subscriptions[subscriptionKey] = descriptor;

            return descriptor;
        },

        unsubscribe: function()
        {
            var descriptor = Ratchet.unsubscribe.apply(this, arguments);

            var subscriptionKey = Ratchet.toLinearForm(descriptor);

            delete this.subscriptions[subscriptionKey];

            return descriptor;
        },

        unsubscribeAll: function()
        {
            for (var subscriptionKey in this.subscriptions)
            {
                var descriptor = this.subscriptions[subscriptionKey];

                Ratchet.unsubscribe(descriptor.scope, descriptor.id, descriptor.listenerId);
            }

            Ratchet.clearObject(this.subscriptions);
        },

        observable: function()
        {
            return Ratchet.observable.apply(this, arguments);
        },

        clearObservable: function()
        {
            return Ratchet.clearObservable.apply(this, arguments);
        },

        dependentObservable: function()
        {
            return Ratchet.dependentObservable.apply(this, arguments);
        },




        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // EVENT HANDLERS - manufacturing methods (produce handlers)
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////


        /**
         * Produces an observable change handler that reloads this gadget with the last dispatched context.
         *
         * @param gadget
         * @param options
         * @param route
         */
        refreshHandler: function(el, options, callback)
        {
            return function(el, options, callback)
            {
                if (typeof(options) === "function") {
                    callback = options;
                    options = {};
                }
                if (!options) {
                    options = {};
                }

                return function(newValue, oldValue)
                {
                    var data = {};
                    if (el.route.data) {
                        data = JSON.parse(JSON.stringify(el.route.data));
                    }

                    if (typeof(options.primary) !== "undefined")
                    {
                        data.primary = options.primary;
                    }

                    if (typeof(options.showPageTransition) !== "undefined")
                    {
                        data.showPageTransition = options.showPageTransition;
                    }

                    el.run(el.route.method, el.route.uri, data, callback);
                };

            }(el, options, callback);
        },



        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // DISPATCH METHODS
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Tells Ratchet to dispatch to another URI.
         *
         * @param [String] method assumes GET
         * @param {String} uri
         * @param [Object] data
         */
        run: function()
        {
            this.ratchet().run.apply(this.ratchet(), arguments);
        },



        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // ROUTE CREATION METHODS
        //
        // NOTE: routes always register with the gadget's ratchet
        // this means that URI routing is always gadget-relative
        //
        //    /a/b/c may mean one thing to gadget #1 and something else to gadget #2
        //
        // NOTE: these methods make sure to wrap the handler in a closure so that "this" is the gadget
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        get: function()
        {
            var array = Ratchet.makeArray(arguments);
            array.push(this);
            this.wrapConfigurable(array);

            this.ratchet().get.apply(this.ratchet(), array);
        },

        post: function()
        {
            var array = Ratchet.makeArray(arguments);
            array.push(this);
            this.wrapConfigurable(array);

            this.ratchet().post.apply(this.ratchet(), array);
        },

        put: function(uri, handler)
        {
            var array = Ratchet.makeArray(arguments);
            array.push(this);
            this.wrapConfigurable(array);

            this.ratchet().put.apply(this.ratchet(), array);
        },

        del: function(uri, handler)
        {
            var array = Ratchet.makeArray(arguments);
            array.push(this);
            this.wrapConfigurable(array);

            this.ratchet().del.apply(this.ratchet(), array);
        },



        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // SELECTORS AND DOM MANIPULATION
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        select: function(selector)
        {
            return this.ratchet().select(selector);
        },



        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // EVENTS
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Binds a single event handler.
         *
         * @param [String] scope an optional behavior scope
         * @param {String} eventId
         * @param {Function} eventHandler
         */
        on: function()
        {
            var descriptor = Ratchet.Events.on.apply(this, arguments);

            var eventKey = Ratchet.toLinearForm(descriptor);
            this.eventHandlers[eventKey] = descriptor;

            return descriptor;
        },

        /**
         * Binds a single event to be triggered only once.  After triggering, the handler is removed.
         *
         * @param [String] scope an optional behavior scope
         * @param {String} eventId
         * @param {Function} eventHandler
         */
        once: function()
        {
            return Ratchet.Events.once.apply(this, arguments);
        },

        /**
         * Removes an event handler.
         *
         * @param [String] scope an optional behavior scope
         * @param {String} eventId
         * @param {Function} eventHandler
         */
        off: function()
        {
            if (arguments.length === 0)
            {
                return this.offAll();
            }

            var descriptor = Ratchet.Events.off.apply(this, arguments);

            var eventKey = Ratchet.toLinearForm(descriptor);

            delete this.eventHandlers[eventKey];

            return descriptor;
        },

        /**
         * Clears all registered events for this gadget.
         */
        offAll: function()
        {
            for (var eventKey in this.eventHandlers)
            {
                var descriptor = this.eventHandlers[eventKey];

                Ratchet.Events.off(descriptor.scope, descriptor.id, descriptor.handlerId);
            }

            Ratchet.clearObject(this.eventHandlers);
        },

        /**
         * Triggers an event.
         *
         * @param [String] scope an optional behavior scope
         * @param {String} eventId
         * @param [Object] eventParameters
         */
        trigger: function()
        {
            return Ratchet.Events.trigger.apply(this, arguments);
        }

    });

})(jQuery);