(function($)
{
    Ratchet.Gadget = Base.extend(
    {
        constructor: function(id, _ratchet)
        {
            this.base();

            var _this = this;

            this.id = id;


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
            // TODO: anything?
        },

        /**
         * Subscribes to an observable, attaching a handler.
         *
         * @param [String] scope
         * @param {String} id
         * @param {Function} handler
         */
        subscribe: function()
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

            // wrap function in a closure
            var func = function(that) {
                return function() {
                    handler.call(that);
                };
            }(this);

            // register
            this.observable(scope, id, func);
        },

        /**
         * Interceptor method that auto-determines the callback key to use in registering the observable
         * based on the gadget id.
         *
         * @param [String] scope optional scope
         * @param {String} id the variable id
         * @param [Function] callbackFunction a callback function to fire when the value of this observable changes
         */
        observable: function()
        {
            var scope;
            var id;
            var callbackFunction;

            var args = Ratchet.makeArray(arguments);
            if (args.length == 1)
            {
                scope = "global";
                id = args.shift();
            }
            else if (args.length == 2)
            {
                var a1 = args.shift();
                var a2 = args.shift();

                if (Ratchet.isFunction(a2))
                {
                    scope = "global";
                    id = a1;
                    callbackFunction = a2;
                }
                else
                {
                    scope = a1;
                    id = a2;
                }
            }
            else if (args.length == 3)
            {
                scope = args.shift();
                id = args.shift();
                callbackFunction = args.shift();
            }

            var callbackKey = this.getGadgetId();

            return this.ratchet().observable(scope, id, callbackKey, callbackFunction);
        },

        /**
         * Interceptor method that just does a pass thru
         */
        dependentObservable: function()
        {
            return this.ratchet().dependentObservable.apply(this.ratchet(), arguments);
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
            this.topRatchet().run.apply(this.ratchet(), arguments);
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
        }

    });

})(jQuery);