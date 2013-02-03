(function($)
{
    Ratchet.Gadget = Base.extend(
    {
        // either (type, _ratchet)
        // or (type, _ratchet, id)
        constructor: function(type, _ratchet, id)
        {
            this.base();

            var _this = this;

            this.type = type;
            this.id = id;

            // if no id, then assume type as id
            if (!this.id)
            {
                this.id = this.type;
            }

            // keep track of any subscriptions this gadget creates
            this.subscriptions = {};

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
         * This method should be overridden and used to register routes and observables and the like.
         */
        setup: function()
        {
        },

        teardown: function()
        {
            // release any subscriptions this gadget might have had
            this.unsubscribeAll();
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
        },

        unsubscribe: function()
        {
            var descriptor = Ratchet.unsubscribe.apply(this, arguments);

            var subscriptionKey = Ratchet.toLinearForm(descriptor);

            delete this.subscriptions[subscriptionKey];
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
            return Ratchet.observable.apply(this, arguments)
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
         * @param route
         */
        refreshHandler: function(el)
        {
            return function(el)
            {
                return function(newValue, oldValue)
                {
                    el.run(el.route.method, el.route.uri, el.route.data);
                };

            }(el);
        },




        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // DISPATCH METHODS
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        /**
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

            this.ratchet().get.apply(this.ratchet(), array);
        },

        post: function()
        {
            var array = Ratchet.makeArray(arguments);
            array.push(this);

            this.ratchet().post.apply(this.ratchet(), array);
        },

        put: function(uri, handler)
        {
            var array = Ratchet.makeArray(arguments);
            array.push(this);

            this.ratchet().put.apply(this.ratchet(), array);
        },

        del: function(uri, handler)
        {
            var array = Ratchet.makeArray(arguments);
            array.push(this);

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
        }

    });

})(jQuery);