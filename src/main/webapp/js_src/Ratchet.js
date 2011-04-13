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
         * @param [DOMElement] container the dom element into which we will render
         * @param [Function] setupFunction setup function
         */
        constructor: function()
        {
            this.base();

            var _this = this;

            // figure out arguments
            var args = Ratchet.makeArray(arguments);
            var a1 = args.shift();
            var a2 = args.shift();
            var a3 = args.shift();

            if (a1 && a2)
            {
                this.container = a1;
                this.setupFunction = a2;
            }
            else if (a1)
            {
                if (Ratchet.isNode(a1) || Ratchet.isElement(a1))
                {
                    this.container = a1;
                }
                else if (Ratchet.isFunction(a1))
                {
                    this.setupFunction = a1;
                }
            }

            if (!this.container)
            {
                this.container = document.body;
            }

            // parent
            this.parent = null;

            // public properties
            this.VERSION = "0.1.0";

            // gadget stuff
            this.gadgetType = "application"; // assumed default
            this.gadgetInstances = [];
            this.gadgetMappings = {};

            // authentication filters
            this.authRequiredPatterns = [];

            /**
             * Called with a matcher like: /pages/{page}/components/{component}
             * and text like: /pages/page1/components/component2
             *
             * If there is a match, the collected tokens are popualted into the tokens map.
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
                            tokens["**"] = "/" + Array.concat(value, array2).join("/");
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

            // find a matching gadget for a uri and gadget scope
            this.findHandler = function(context)
            {
                Ratchet.debug("Looking for gadget handler (type=" + _this.gadgetType + ", method=" + context.method + ", uri=" + context.uri + ")");

                var handler = null;
                var tokens = null;

                // walk through the gadget mappings for this scope
                // find one that matches this URI and method
                var found = null;
                for (var mapping in _this.gadgetMappings)
                {
                    var entry = _this.gadgetMappings[mapping];

                    if (entry.method == context.method)
                    {
                        tokens = _this.executeMatch(entry.uri, context.uri);
                        if (tokens)
                        {
                            Ratchet.debug(" -> Match (type=" + _this.gadgetType + ", method=" + entry.method + ", uri=" + entry.uri + ")");
                            Ratchet.debug(" -> Tokens: " + Ratchet.stringify(tokens));
                            found = entry;
                            break;
                        }
                    }

                    Ratchet.debug(" -> No Match (type=" + _this.gadgetType + ", method=" + entry.method + ", uri=" + entry.uri + ")");
                }

                // build an empty model
                var model = {};

                // if we have a matching gadget...
                if (found)
                {
                    if (!tokens)
                    {
                        tokens = {};
                    }
                    context.tokens = tokens;

                    var that = found.that;

                    var viewHandler = null;
                    var controllerHandler = null;

                    if (found.viewHandler)
                    {
                        // create a copy of the context especially for the view handler
                        var viewHandlerContext = {};
                        Ratchet.copyInto(viewHandlerContext, context);

                        viewHandler = function()
                        {
                            viewHandlerContext.successHandler = function() {

                                // gadget-specific post-render stuff
                                if (that.postRender)
                                {
                                    that.postRender(context, model);
                                }

                                // standard post-render stuff
                                _this.postRender(context, model);

                            };
                            viewHandlerContext.failureHandler = function() {

                                _this.error("Problem during view handler: " + error);
                            };

                            found.viewHandler.call(that, viewHandlerContext, model);
                        };

                        // assume view handler
                        handler = viewHandler;
                    }

                    if (found.controllerHandler)
                    {
                        // create a copy of the context especially for the controller handler
                        var controllerHandlerContext = {};
                        Ratchet.copyInto(controllerHandlerContext, context);

                        controllerHandler = function()
                        {
                            // NOTE: model comes back on the success handler
                            controllerHandlerContext.successHandler = function()
                            {
                                viewHandler.call(that, context, model);
                            };
                            controllerHandlerContext.failureHandler = function()
                            {
                                _this.error("Problem during controller handler: " + error);
                            };
                            found.controllerHandler.call(that, controllerHandlerContext, model);
                        };

                        // use a controller handler instead
                        // this calls through to the view handler upon completion
                        handler = controllerHandler;
                    }
                }
                else
                {
                    // no gadget handler was found

                    // as a result, we can produce a in-place gadget handler that simply assumes that the dom stuff contained
                    // in the container is already correct and marked up.
                    // we then just do post processing on it

                    handler = function()
                    {
                        _this.postRender(context, model);
                    };
                }


                return handler;
            };

            // dispatch
            this.dispatch = function(context)
            {
                // clean up URI
                if (Ratchet.startsWith(context.uri, "#"))
                {
                    context.uri = context.uri.substring(1);
                }

                _this.ensureAuthentication(context, function() {

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
            };

            // init
            this.init();
        },

        /**
         * Walks through all of the controllers and views and instantiates them.
         * This lets them register their mappings (routes) with the dispatcher.
         */
        init: function()
        {
            var _this = this;

            // invoke setup function
            if (this.setupFunction)
            {
                this.setupFunction.call(this);
            }

            // instantiate any gadgets for that match the type of gadget we're supposed to be dispatching for
            this.gadgetInstances = Ratchet.GadgetRegistry.instantiate(this.gadgetType, this, this.container);

            // history support
            // NOTE: only for the top-most dispatcher
            if (!this.getParent())
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
         * Performs standard post-render manipulation of the dom.
         *
         * This gets called AFTER the gadget gets the post-render call.
         *
         * @param context
         * @param model
         */
        postRender: function(context, model)
        {
            // kick off dispatchers for any sub-gadgets
            var _this = this;
            $(_this.getContainer()).find("[gadget]").each(function()
            {
                var subGadgetType = $(this).attr("gadget");

                $(this).removeAttr("gadget");

                // instantiate a child ratchet on top of this element
                var childRatchet = new Ratchet($(this), function() {
                    this.setParent(_this);
                    this.setGadgetType(subGadgetType);
                });

                // dispatch the child ratchet
                childRatchet.dispatch(context);
            });
        },

        getContainer: function()
        {
            return this.container;
        },

        setContainer: function(container)
        {
            this.container = container;
        },

        getParent: function()
        {
            return this.parent;
        },

        setParent: function(parent)
        {
            this.parent = parent;
        },

        getGadgetType: function()
        {
            return this.gadgetType;
        },

        setGadgetType: function(gadgetType)
        {
            this.gadgetType = gadgetType;
        },

        /**
         * Registers a route for a gadget.
         *
         * @param that (the "this" reference for the function)
         * @param uri
         * @param method
         * @param viewHandler
         * @param controllerHandler
         */
        route: function(that, uri, method, viewHandler, controllerHandler)
        {
            var mappingId = "route-" + Ratchet.generateId();

            this.gadgetMappings[mappingId] = {
                "that": that,
                "uri": uri,
                "method": method,
                "viewHandler": viewHandler,
                "controllerHandler": controllerHandler
            };
        },


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // DISPATCH SHORTCUT METHODS
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Dispatches a GET to a URI.
         *
         * @param uri
         */
        get: function(uri)
        {
            // NOTE: We actually increment the history here and let the history callback handler
            // do the get for us.

            $.history.load(uri);
        },

        /**
         * Dispatches a POST to a URI.
         *
         * @param uri
         * @param data
         */
        post: function(uri, data)
        {
            this.dispatch({
                "method": "POST",
                "uri": uri,
                "data": data
            });
        },

        /**
         * Dispatches a PUT to a URI.
         *
         * @param uri
         * @param data
         */
        put: function(uri, data)
        {
            this.dispatch({
                "method": "PUT",
                "uri": uri,
                "data": data
            });
        },

        /**
         * Dispatches a DELETE to a URI.
         *
         * @param uri
         */
        del: function(uri)
        {
            this.dispatch({
                "method": "DELETE",
                "uri": uri
            });
        },


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // OBSERVABLES HELPER FUNCTIONS
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Gets all of the observables in the given scope.
         *
         * If no scope is provided, the "global" scope is assumed.
         *
         * @param scope
         */
        scope: function(scope)
        {
            if (!scope)
            {
                scope = "global";
            }

            return Ratchet.ScopedObservables.get(scope);
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

            // walk the patterns and see if any trip
            var tripped = false;
            for (var i = 0; i < this.authRequiredPatterns.length; i++)
            {
                var pattern = this.authRequiredPatterns[i];

                var tokens = this.executeMatch(pattern, context.uri);
                if (tokens)
                {
                    tripped = true;
                }
            }

            if (tripped)
            {
                // we require authentication
                this.authenticate(context, function() {

                    successCallback();

                }, function() {

                    failureCallback();

                });
            }
            else
            {
                successCallback();
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