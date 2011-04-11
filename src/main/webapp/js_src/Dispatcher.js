(function($)
{
    Ratchet.Dispatcher = Ratchet.Abstract.extend(
    {
        /**
         * Instantiates the Ratchet dispatcher.
         *
         * @param [DOMElement] el the dom element to bind to
         * @param [Object] options any options
         */
        constructor: function(el, options)
        {
            var _this = this;

            this.base();

            // figure out arguments
            var args = this.makeArray(arguments);
            var a1 = args.shift();
            var a2 = args.shift();
            if (a2)
            {
                this.el = a1;
                this.options = a2;
            }
            else
            {
                if (this.isNode(a1) || this.isElement(a1))
                {
                    this.el = a1;
                }
                else
                {
                    this.options = a1;
                }
            }
            if (!this.el)
            {
                this.el = document.body;
            }
            if (!this.options)
            {
                this.options = {};
            }

            // public properties
            this.VERSION = "0.1.0";

            // controller mappings
            this.controllerMappings = {};

            // view resolver mappings
            this.viewResolverMappings = {};

            // controller instances
            this.controllerInstances = {};

            // view resolver instances
            this.viewResolverInstances = {};


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
                    if (!this.isEmpty(pattern) && !this.isEmpty(value))
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
                        else if (this.startsWith(pattern, "{"))
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
                        if ((pattern && this.isEmpty(value)) || (this.isEmpty(pattern) && value))
                        {
                            return null;
                        }
                    }
                }
                while (!this.isEmpty(pattern) && !this.isEmpty(value));

                return tokens;
            };

            // find a matching controller for a uri
            this.matchController = function(modelAndView, uri, method)
            {
                _this.debug("Looking for controller (method=" + method + ", uri=" + uri + ")");

                var tokens = null;

                // walk through the controller mappings and find the one that matches
                var found = null;
                for (var mapping in _this.controllerMappings)
                {
                    var entry = _this.controllerMappings[mapping];

                    if (entry.method == method)
                    {
                        tokens = _this.executeMatch(entry.uri, uri);
                        if (tokens)
                        {
                            _this.debug(" -> Match (method=" + entry.method + ", uri=" + entry.uri + ")");
                            _this.debug(" -> Tokens: " + this.buildString(tokens));
                            found = entry;
                            break;
                        }
                    }

                    _this.debug(" -> No Match (method=" + entry.method + ", uri=" + entry.uri + ")");
                }

                var wrappedHandler = null;
                if (found)
                {
                    if (!tokens)
                    {
                        tokens = {};
                    }
                    modelAndView.setTokens(tokens);

                    var handler = found.handler;
                    var that = found.that;

                    wrappedHandler = function()
                    {
                        handler.call(that, modelAndView);
                    };
                }

                return wrappedHandler;
            };

            // find a matching view resolver for a uri
            this.matchViewResolver = function(modelAndView)
            {
                _this.debug("Looking for view (uri=" + modelAndView.getView() + ")");

                // walk through the view mappings and find the one that matches
                var found = null;
                for (var mapping in _this.viewResolverMappings)
                {
                    var entry = _this.viewResolverMappings[mapping];

                    var tokens = _this.executeMatch(entry.uri, modelAndView.getView());
                    if (tokens)
                    {
                        _this.debug(" -> Match (uri=" + entry.uri + ")");
                        _this.debug(" -> Tokens: " + this.buildString(tokens));
                        found = entry;
                        break;
                    }

                    _this.debug(" -> No Match (uri=" + entry.uri + ")");
                }

                var wrappedHandler = null;
                if (found)
                {
                    var handler = found.handler;
                    var that = found.that;

                    wrappedHandler = function()
                    {
                        handler.call(that, modelAndView);
                    };
                }

                return wrappedHandler;
            };

            // dispatch
            this.dispatch = function(config)
            {
                var method = config.method;
                var uri = config.uri;
                var data = config.data;

                if (_this.startsWith(uri, "#"))
                {
                    uri = uri.substring(1);
                }

                ///////////////////////////////////////////////////////////////////////////////////////////////////////
                //
                // CREATE APPLICATION AND RENDER
                //
                ///////////////////////////////////////////////////////////////////////////////////////////////////////

                // build model and view
                var modelAndView = new Ratchet.ModelAndView();
                modelAndView.setData(data);

                // find the controller handler method that matches this uri
                var wrappedHandler = _this.matchController(modelAndView, uri, method);
                if (wrappedHandler)
                {
                    // invoke the controller method
                    wrappedHandler();
                }
                else
                {
                    // no controller handler found
                    // in this case, we just assume there isn't anything to set up and we forward to the view
                    var view = uri;
                    if (!view || "" == view || "/" == view)
                    {
                        view = "index";
                    }
                    if (_this.startsWith(view, "/"))
                    {
                        view = view.substring(1);
                    }
                    modelAndView.setView(view);
                    _this.renderView(modelAndView);
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

            // instantiate all of the controllers
            $.each(Ratchet.ControllerRegistry.registry, function(id, classObject)
            {
                var instance = Ratchet.ControllerRegistry.produce(id, _this);
                _this.controllerInstances[id] = instance;
            });

            // instantiate all of the view resolvers
            $.each(Ratchet.ViewResolverRegistry.registry, function(id, classObject)
            {
                var instance = Ratchet.ViewResolverRegistry.produce(id, _this);
                _this.viewResolverInstances[id] = instance;
            });

            // set up any configuration mappings for controllers
            if (this.options.controllers)
            {
                $.each(this.options.controllers, function(index, o) {

                    var controllerId = o.controller;

                    // get the controller instance
                    var controllerInstance = _this.controllerInstances[controllerId];
                    if (controllerInstance)
                    {
                        // convention
                        var handlerId = o.handler;
                        if (!handlerId)
                        {
                            handlerId = controllerId;
                        }

                        var handler = controllerInstance[handlerId];
                        if (handler)
                        {
                            _this.mapController(controllerInstance, o.uri, o.method, handler);
                        }
                        else
                        {
                            _this.debug("Cannot find handler method: " + handlerId + " on controller instance: " + controllerId);
                        }
                    }
                    else
                    {
                        _this.debug("Cannot find controller instance: " + controllerId);
                    }
                });
            }

            // set up any configuration mappings for view resolvers
            if (this.options.viewResolvers)
            {
                $.each(this.options.viewResolvers, function(index, o) {

                    var viewResolverId = o.viewResolver;

                    // get the view resolver instance
                    var viewResolverInstance = _this.viewResolverInstances[viewResolverId];
                    if (viewResolverInstance)
                    {
                        // convention
                        var handlerId = o.handler;
                        if (!handlerId)
                        {
                            handlerId = viewResolverId;
                        }

                        var handler = viewResolverInstance[handlerId];
                        if (handler)
                        {
                            _this.mapViewResolver(viewResolverInstance, o.uri, handler)
                        }
                        else
                        {
                            _this.debug("Cannot find handler method: " + handlerId + " on view resolver instance: " + viewResolverId);
                        }
                    }
                    else
                    {
                        _this.debug("Cannot find view resolver instance: " + viewResolverId);
                    }
                });
            }

            // history support
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
        },

        getElement: function()
        {
            return this.el;
        },

        /**
         * Adds a mapping for a controller
         *
         * @param that (the "this" reference for the function)
         * @param uri
         * @param method
         * @param handler
         */
        mapController: function(that, uri, method, handler)
        {
            var mappingId = "mapping-" + this.generateId();

            this.controllerMappings[mappingId] = {
                "uri": uri,
                "method": method,
                "handler": handler,
                "that": that
            };
        },

        /**
         * Adds a mapping for a view
         *
         * @param that (the "this" reference for the function)
         * @param uri
         * @param handler
         */
        mapViewResolver: function(that, uri, handler)
        {
            var mappingId = "mapping-" + this.generateId();

            this.viewResolverMappings[mappingId] = {
                "uri": uri,
                "handler": handler,
                "that": that
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
        },

        /**
         * Renders the model and view.
         *
         * @param modelAndView
         */
        renderView: function(modelAndView)
        {
            // find the view handler method that matches this uri
            var wrappedHandler = this.matchViewResolver(modelAndView);
            if (wrappedHandler)
            {
                wrappedHandler();
            }
        }
    });

})(jQuery);