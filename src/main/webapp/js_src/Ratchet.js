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

            // observation pool
            this.observationPool = new Ratchet.ObservationPool();

            // public properties
            this.VERSION = "0.1.0";

            // gadget stuff
            this.gadgetId = "application"; // assumed default
            this.gadgetInstance = null;
            this.gadgetMappings = {};

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
            this.findHandler = function(model, context)
            {
                Ratchet.debug("Looking for gadget handler (id=" + _this.gadgetId + ", method=" + context.method + ", uri=" + context.uri + ")");

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
                            Ratchet.debug(" -> Match (id=" + _this.gadgetId + ", method=" + entry.method + ", uri=" + entry.uri + ")");
                            Ratchet.debug(" -> Tokens: " + Ratchet.stringify(tokens));
                            found = entry;
                            break;
                        }
                    }

                    Ratchet.debug(" -> No Match (id=" + _this.gadgetId + ", method=" + entry.method + ", uri=" + entry.uri + ")");
                }

                if (found)
                {
                    if (!tokens)
                    {
                        tokens = {};
                    }
                    model.setTokens(tokens);

                    var that = found.that;

                    var viewHandler = null;
                    var controllerHandler = null;

                    if (found.controllerHandler)
                    {
                        // create a copy of the context especially for the controller handler
                        var controllerHandlerContext = {};
                        Ratchet.copyInto(controllerHandlerContext, context);

                        controllerHandler = function()
                        {
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

                        handler = controllerHandler;
                    }

                    if (found.viewHandler)
                    {
                        // create a copy of the context especially for the view handler
                        var viewHandlerContext = {};
                        Ratchet.copyInto(viewHandlerContext, context);

                        viewHandler = function()
                        {
                            viewHandlerContext.successHandler = function() {

                                _this.gadgetInstance.postRender(context, model);
                            };
                            viewHandlerContext.failureHandler = function() {

                                _this.error("Problem during view handler: " + error);
                            };

                            found.viewHandler.call(that, viewHandlerContext, model);
                        };

                        // if we already have a controller handler selected, don't reassign
                        if (!handler)
                        {
                            handler = viewHandler;
                        }
                    }
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

                // build the model
                var model = new Ratchet.Model(_this.observationPool);
                model.setData(context.data);

                // find the controller handler method that matches this uri
                var wrappedHandler = _this.findHandler(model, context);
                if (wrappedHandler)
                {
                    // invoke the handler
                    wrappedHandler();
                }
            };

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

            // instantiate our gadget
            this.gadgetInstance = Ratchet.GadgetRegistry.produce(this.gadgetId, this, this.container);

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

            // use parent observation pool
            if (this.parent)
            {
                this.observationPool = this.parent.observationPool;
            }
        },

        getGadgetId: function()
        {
            return this.gadgetId;
        },

        setGadgetId: function(gadgetId)
        {
            this.gadgetId = gadgetId;
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
        }
    });

})(jQuery);