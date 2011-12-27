(function($)
{
    Ratchet = Base.extend(
    {
        /**
         * Instantiates a ratchet.
         *
         * The ratchet will render into the given dom element.  If no dom element is provided, the document body
         * will be assumed.
         *
         * If a function is provided, it will be invoked post-constructor to allow for any setup or configuration
         * of the ratchet.
         *
         * @param [DOMElement|String] container either a dom element or selector into which we will render
         * @param [Object] parent the parent ratchet if any
         * @param [Function] setupFunction setup function
         */
        constructor: function()
        {
            this.base();

            var _this = this;

            // figure out arguments
            var args = Ratchet.makeArray(arguments);

            do
            {
                var arg = args.shift();
                if (arg)
                {
                    if (Ratchet.isArray(arg) && (Ratchet.isNode(arg[0]) || Ratchet.isElement(arg[0])))
                    {
                        this.el = arg[0];
                    }
                    else if (Ratchet.isNode(arg) || Ratchet.isElement(arg))
                    {
                        this.el = arg;
                    }
                    else if (Ratchet.isFunction(arg))
                    {
                        this.setupFunction = arg;
                    }
                    else
                    {
                        this.parent = arg;
                    }
                }

            } while (arg);

            // if no container, assume document body
            if (!this.el)
            {
                this.el = document.body;
            }

            // child ratchets
            this.childRatchets = {};

            // authentication filters
            this.authRequiredPatterns = [];

            // routes
            this.routes = {};

            // ratchet id
            this.id = Ratchet.generateId();

            // gadget instance and type
            this.gadgetInstances = [];
            this.gadgetType = null;

            // subscriptions
            this.subscriptions = {};

            // claim the element by marking it with the ratchet id
            $(this.el).attr("ratchet", this.id);



            ///////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // PRIVILEGED METHODS
            //
            ///////////////////////////////////////////////////////////////////////////////////////////////////////


            /**
             * Called with a matcher like: /pages/{page}/components/{component}
             * and text like: /pages/page1/components/component2
             *
             * If there is a match, the collected tokens are populated into the tokens map.
             * It looks like this:
             *
             *   {
             *      "page": "page1",
             *      "component": "component2"
             *   }
             *
             * If there isn't a match, null is returned.
             *
             * @param matcher
             * @param text
             */
            this.executeMatch = function(matcher, text)
            {
                var tokens = {};

                // short cut - **
                if (matcher == "**")
                {
                    // it's a match, pull out wildcard token
                    tokens["**"] = text;
                    return tokens;
                }

                // if matcher has no wildcards or tokens...
                if ((matcher.indexOf("{") == -1) && (matcher.indexOf("*") == -1))
                {
                    // if they're equal...
                    if (matcher == text)
                    {
                        // it's a match, no tokens
                        return tokens;
                    }
                }

                var array1 = matcher.split("/");
                var array2 = text.split("/");

                // short cut - zero length matches
                if ((array1.length == 0) && (array2.length == 0))
                {
                    return tokens;
                }

                do
                {
                    var pattern = array1.shift();
                    var value = array2.shift();

                    // if there are remaining pattern and value elements
                    if (!Ratchet.isEmpty(pattern) && !Ratchet.isEmpty(value))
                    {
                        if (pattern == "*")
                        {
                            // wildcard - element matches
                        }
                        else if (pattern == "**")
                        {
                            // wildcard - match everything else, so break out
                            tokens["**"] = "/" + [].concat(value, array2).join("/");
                            //tokens["**"] = "/" + Array.concat(value, array2).join("/");
                            break;
                        }
                        else if (Ratchet.startsWith(pattern, "{"))
                        {
                            // token, assume match, pull into token map
                            var key = pattern.substring(1, pattern.length - 1);
                            tokens[key] = value;
                        }
                        else
                        {
                            // check for exact match
                            if (pattern == value)
                            {
                                // exact match
                            }
                            else
                            {
                                // not a match, thus fail
                                return null;
                            }
                        }
                    }
                    else
                    {
                        if ((pattern && Ratchet.isEmpty(value)) || (Ratchet.isEmpty(pattern) && value))
                        {
                            return null;
                        }
                    }
                }
                while (!Ratchet.isEmpty(pattern) && !Ratchet.isEmpty(value));

                return tokens;
            };

            /**
             * Finds a matching handler method for a given dispatch context
             *
             * @param context
             */
            this.findHandler = function(context)
            {
                var handler = null;

                // walk through the routes and find one that matches this URI and method
                var tokens = null;
                var discoveredHandler = null;
                for (var routeId in _this.routes)
                {
                    var route = _this.routes[routeId];
                    if (route.method == context.route.method)
                    {
                        tokens = _this.executeMatch(route.uri, context.route.uri);
                        if (tokens)
                        {
                            discoveredHandler = route.handler;
                            break;
                        }
                    }
                }

                // find a matching handler method
                if (discoveredHandler)
                {
                    // create an invocation context
                    // this is a copy of the original context which will be used by the handler
                    var invocationContext = new Ratchet.RenderContext(this, context.route);
                    Ratchet.copyInto(invocationContext.model, context.model);
                    invocationContext.tokens = tokens;

                    // wrap the handler into a closure (convenience function)
                    handler = function(invocationContext)
                    {
                        return function()
                        {
                            discoveredHandler.call(discoveredHandler, invocationContext, invocationContext.route.data);
                        };
                    }(invocationContext);
                }
                else
                {
                    // no matching route found
                    // fire no-match custom event
                    $('body').trigger('no-match', [context]);
                    //console.log('Trigger event for ' + context.route.uri);

                    // create an invocation context that assumes the current dom is just fine
                    var invocationContext = new Ratchet.RenderContext(this, context.route, this.el);
                    Ratchet.copyInto(invocationContext.model, context.model);

                    // manually swap
                    // NOTE: this calls "processGadgets" for us
                    invocationContext.swap();
                }

                return handler;
            };


            // init
            this.init();
        },

        /**
         * The init method is called once when the dispatcher is started up.
         */
        init: function()
        {
            var _this = this;

            // history support
            // NOTE: only for the top-most dispatcher
            if (!this.parent)
            {
                $.history.init(function(hash) {

                    if(hash == "")
                    {
                        // TODO: assume any default dispatching?
                        // i.e.
                        // hash = "/";
                    }

                    if (hash != "")
                    {
                        // restore the state from hash
                        _this.dispatch({
                            "method": "GET",
                            "uri": "#" + hash
                        });
                    }
                },{
                    unescape: ",/#"
                });
            }
        },

        /**
         * The setup function is called prior to the dispatch() method being invoked.
         * It is the inverse of the teardown method.
         */
        setup: function()
        {
            // invoke setup function
            if (this.setupFunction)
            {
                this.setupFunction.call(this);
            }

            // if we don't have a gadget type, we should check the DOM to see if one is configured on the DOM element
            // to which we are bound
            if (!this.gadgetType)
            {
                this.gadgetType = $(this.el).attr("gadget");
            }

            // if there is a gadget configured for this dom element, boot it up
            if (this.gadgetType)
            {
                this.gadgetInstances = Ratchet.GadgetRegistry.instantiate(this.gadgetType, this);
                $.each(this.gadgetInstances, function(x, y) {
                    y.setup.call(y);
                });
            }
        },

        /**
         * Dismantles this ratchet.  Destroys any containers, gadget instances or mappings set up during init.
         */
        teardown: function()
        {
            var _this = this;

            // iterate to tear down any child ratchets
            // destroy all child ratchets
            $.each(this.childRatchets, function(_gadgetId, childRatchet) {
                childRatchet.teardown();
            });

            // delete child ratchets
            $.each(this.childRatchets, function(_gadgetId, childRatchet) {
                delete childRatchet;
            });
            this.childRatchets = {};

            // remove the ratchet id from our dom element
            //$(this.el).removeAttr("ratchet");

            // releases any subscribed observables
            $.each(this.subscriptions, function(callbackKey, observable) {
                observable.unsubscribe(callbackKey);
            });

            // tear down any gadget instances
            $.each(this.gadgetInstances, function(i, gadgetInstance) {
                gadgetInstance.teardown();
            });
            this.gadgetInstances = [];

            // releases any routes
            $.each(this.routes, function(i, route) {
                delete _this.routes[i];
            });
            this.routes = {};
        },

        /**
         * Processes any downstream gadgets.
         */
        processGadgets: function(context)
        {
            var _this = this;

            // deal with an tagged sub-gadgets
            $(context.closestDescendants("[gadget]")).each(function()
            {
                var subGadgetType = $(this).attr("gadget");
                //$(this).removeAttr("gadget");

                // check if we already have a child ratchet for this gadget
                var ratcheted = false;
                var subRatchetId = $(this).attr("ratchet");
                if (subRatchetId)
                {
                    var childRatchet = _this.childRatchets[subRatchetId];
                    if (childRatchet)
                    {
                        // make sure the child ratchet is pointing to our dom element
                        childRatchet.el = this;

                        // make sure our new dom element has the updated ratchet id
                        $(childRatchet.el).attr("ratchet", subRatchetId);

                        ratcheted = true;
                    }
                }

                if (!ratcheted)
                {
                    // instantiate a child ratchet on top of this element
                    childRatchet = new Ratchet($(this), _this, function() {
                        this.gadgetType = subGadgetType;
                    });

                    _this.childRatchets[childRatchet.id] = childRatchet;
                }
            });

            // dispatch the child ratchets
            $.each(_this.childRatchets, function(subGadgetId, childRatchet) {
                //Ratchet.debug("Dispatching child ratchet: " + subGadgetId + " (" + context.route.method + " " + context.route.uri + ")");
                childRatchet.dispatch(context.route);
            });
        },



        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // ROUTE CREATION METHODS
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Registers a GET route.
         *
         * @param [String] uri
         * @param {Function} handler
         * @param [Object] that
         */
        get: function()
        {
            var args = Ratchet.makeArray(arguments);
            if (Ratchet.isFunction(args[0]))
            {
                args.unshift("**");
            }
            args.unshift("GET");

            this.route.apply(this, args);
        },

        /**
         * Registers a POST route.
         *
         * @param [String] uri
         * @param {Function} handler
         * @param [Object] that
         */
        post: function()
        {
            var args = Ratchet.makeArray(arguments);
            if (Ratchet.isFunction(args[0]))
            {
                args.unshift("**");
            }
            args.unshift("POST");

            this.route.apply(this, args);
        },

        /**
         * Registers a PUT route.
         *
         * @param [String] uri
         * @param {Function} handler
         * @param [Object] that
         */
        put: function(uri, handler)
        {
            var args = Ratchet.makeArray(arguments);
            if (Ratchet.isFunction(args[0]))
            {
                args.unshift("**");
            }
            args.unshift("PUT");

            this.route.apply(this, args);
        },

        /**
         * Registers a DELETE route.
         *
         * @param [String] uri
         * @param {Function} handler
         * @param [Object] that
         */
        del: function(uri, handler)
        {
            var args = Ratchet.makeArray(arguments);
            if (Ratchet.isFunction(args[0]))
            {
                args.unshift("**");
            }
            args.unshift("DELETE");

            this.route.apply(this, args);
        },

        /**
         * Registers a route for a gadget.
         *
         * @param {String} method the method to bind to
         * @param [String] uri the uri to bind to (if none, will use "**")
         * @param {Function} handler
         * @param [Object] that
         */
        route: function()
        {
            var method = null;
            var uri = null;
            var handler = null;
            var that = null;

            var args = Ratchet.makeArray(arguments);

            if (args.length == 2)
            {
                method = args.shift();
                uri = "**";
                handler = args.shift();
            }
            else if (args.length == 3)
            {
                method = args.shift();
                uri = args.shift();
                handler = args.shift();
            }
            else if (args.length == 4)
            {
                method = args.shift();
                uri = args.shift();
                handler = args.shift();
                that = args.shift();
            }
            else
            {
                Ratchet.error("Wrong number of arguments");
                return;
            }

            if (!that)
            {
                that = handler;
            }

            // wrap handler in closure
            var func = function(that, handler) {
                return function(el, data) {
                    handler.call(that, el, data);
                };
            }(that, handler);

            var routeId = method + "-" + uri;

            this.routes[routeId] = {
                "uri": uri,
                "method": method,
                "handler": func
            };

            //Ratchet.debug("Mapped gadget handler: " + method + " " + uri);
        },


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // DISPATCH SHORTCUT METHODS
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Performs a generalized dispatch.
         *
         * Configuration object:
         * {
         *   "uri": <uri>,
         *   "method": <method>,
         *   "data": <any data>
         * }
         *
         * @param config
         */
        dispatch: function(config)
        {
            var _this = this;

            // teardown: clean up old observers, routes, gadget instances and the like
            this.teardown();

            // setup: new observers, routes and gadget instances
            this.setup();

            // clean up URI
            if (Ratchet.startsWith(config.uri, "#"))
            {
                config.uri = config.uri.substring(1);
            }

            var context = new Ratchet.RenderContext(this, config);

            // ensure authentication filter passes
            this.ensureAuthentication.call(this, context, function() {

                // find the controller handler method that matches this uri
                var wrappedHandler = _this.findHandler(context);
                if (wrappedHandler)
                {
                    // invoke the handler
                    wrappedHandler();
                }

            }, function() {

                alert("Authentication failed - not authenticated");

            });
        },

        /**
         * Runs a route.
         *
         * @param [String] method assumes GET
         * @param {String} uri
         * @param [Object] data
         */
        run: function()
        {
            var config = {
                "method": "GET",
                "data": {}
            };

            var args = Ratchet.makeArray(arguments);
            if (args.length == 0)
            {
                uri = window.location.href;
                if (uri.indexOf("#") > -1)
                {
                    uri = uri.substring(uri.indexOf("#") + 1);
                }
                else
                {
                    uri = "/";
                }
                config.uri = uri;
            }
            else if (args.length == 1)
            {
                config.uri = args.shift();
            }
            else if (args.length == 2)
            {
                var a1 = args.shift();
                var a2 = args.shift();

                if (Ratchet.isString(a2))
                {
                    config.method = a1;
                    config.uri = a2;
                }
                else
                {
                    config.uri = a1;
                    config.data = a2;
                }
            }
            else if (args.length == 3)
            {
                config.method = args.shift();
                config.uri = args.shift();
                config.data = args.shift();
            }

            // if we're the top dispatcher (app scope) and we're doing a get, store onto history
            // this lets the history callback make the dispatch for us
            if (config.method == "GET" && !this.parent)
            {
                $.history.load(config.uri);
            }
            else
            {
                this.dispatch(config);
            }
        },


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // OBSERVABLES HELPER FUNCTIONS
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Declares and gets an observable in a given scope.
         * Optionally registers a callback function.
         *
         * @param [String] scope optional scope
         * @param {String} id the variable id
         * @param [String] callbackKey callback key
         * @param [Function] callbackFunction a callback function to fire when the value of this observable changes
         */
        observable: function()
        {
            var scope;
            var id;
            var callbackKey;
            var callbackFunction;

            var args = Ratchet.makeArray(arguments);
            if (args.length == 1)
            {
                scope = "global";
                id = args.shift();
            }
            else if (args.length == 2)
            {
                scope = args.shift();
                id = args.shift();
            }
            else if (args.length == 3)
            {
                scope = "global";
                id = args.shift();
                callbackKey = args.shift();
                callbackFunction = args.shift();
            }
            else if (args.length == 4)
            {
                scope = args.shift();
                id = args.shift();
                callbackKey = args.shift();
                callbackFunction = args.shift();
            }

            var observables = Ratchet.ScopedObservables.get(scope);
            var observable = observables.observable(id);

            // binding a function handler
            if (callbackKey && callbackFunction)
            {
                // subscribe
                observable.subscribe(callbackKey, callbackFunction);

                // remember we subscribed
                this.subscriptions[callbackKey] = observable;
            }

            return observable;
        },

        /**
         * Declares and gets a dependent observable in a given scope
         *
         * @param scope
         * @param id
         * @param func
         */
        dependentObservable: function()
        {
            var scope = null;
            var id = null;
            var func = null;

            var args = Ratchet.makeArray(arguments);
            if (args.length == 2)
            {
                scope = "global";
                id = args.shift();
                func = args.shift();
            }
            else if (args.length == 3)
            {
                scope = args.shift();
                id = args.shift();
                func = args.shift();
            }
            else
            {
                Ratchet.error("Wrong number of arguments");
                return;
            }

            var observables = Ratchet.ScopedObservables.get(scope);

            return observables.dependentObservable(id, func);
        },



        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // AUTHENTICATION
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Marks a URI patterns as requiring authentication.  Supports wildcards.
         *
         * @param pattern
         */
        requireAuthentication: function(pattern)
        {
            this.authRequiredPatterns.push(pattern);
        },

        /**
         * @extension_point
         *
         * Plug in authentication modal, fire callback when done.
         *
         * @param context
         * @param successCallback
         * @param failureCallback
         */
        ensureAuthentication: function(context, successCallback, failureCallback)
        {
            var _this = this;

            // short cut
            if (this.authRequiredPatterns.length == 0)
            {
                successCallback();
            }
            else
            {
                // walk the patterns and see if any trip
                var tripped = false;
                for (var i = 0; i < this.authRequiredPatterns.length; i++)
                {
                    var pattern = this.authRequiredPatterns[i];

                    var tokens = this.executeMatch(pattern, context.route.uri);
                    if (tokens)
                    {
                        tripped = true;
                    }
                }

                if (tripped)
                {
                    // we require authentication
                    if (this.authenticator && this.authenticator.authenticate)
                    {
                        this.authenticator.authenticate(context, function() {

                            successCallback();

                        }, function() {

                            failureCallback();

                        });
                    }
                    else
                    {
                        this.authenticate.call(_this, context, function() {

                            successCallback();

                        }, function() {

                            failureCallback();

                        });
                    }
                }
                else
                {
                    successCallback();
                }
            }
        },

        /**
         * @extension_point
         *
         * This gets called when a decision is made to challenge the user for authentication.
         * This method should first check whether authentication already exists and if so, just fire the callback.
         *
         * @param context
         * @param successCallback
         * @param failureCallback
         */
        authenticate: function(context, successCallback, failureCallback)
        {
            // default logic, just fire back
            successCallback();
        }

    });

})(jQuery);