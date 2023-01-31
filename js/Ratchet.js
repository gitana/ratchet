/*jshint -W004 */ // duplicate variables
(function($)
{
    var HASH_CHANGE_APPLIED = false;

    Ratchet = Base.extend(
    {
        /**
         * The default URI that gets dispatched on an initial empty run() call.
         */
        DEFAULT_URI: "/",

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

            var arg = null;
            do
            {
                arg = args.shift();
                if (typeof(arg) !== "undefined")
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
                    else if (typeof(arg) === "boolean")
                    {
                        if (arg)
                        {
                            this.detached = true;
                        }
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

            this.hasChildRatchets = function()
            {
                return (this.childRatchetCount() > 0);
            };

            this.childRatchetCount = function()
            {
                return Ratchet.countProperties(this.childRatchets);
            };

            // authentication filters
            this.authPatterns = [];
            this.noAuthPatterns = [];
            this.guestAuthPatterns = [];

            // routes
            this.routes = {};

            // ratchet id
            this.id = Ratchet.generateId();

            // gadget bindings: instance, type and strategy
            this.gadgetInstances = [];
            this.gadgetType = null;
            this.gadgetStrategy = null;

            // subscriptions
            this.subscriptions = {};

            // whether to use handler callbacks
            // default to the global setting
            this.useHandlerCallbacks = Ratchet.useHandlerCallbacks;

            if (!this.parent)
            {
                this.dispatchCount = 0;
                this.dispatchCompletionCount = 0;
            }

            this.incrementDispatchCount = function() {
                _this.topRatchet().dispatchCount++;
            };
            this.incrementDispatchCompletionCount = function() {
                _this.topRatchet().dispatchCompletionCount++;
            };
            this.isDispatchCompleted = function() {
                return (_this.topRatchet().dispatchCompletionCount == _this.topRatchet().dispatchCount);
            };
            this.isUsingHandlerCallbacks = function() {
                return (_this.topRatchet().useHandlerCallbacks);
            };

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
                return Ratchet.executeMatch(matcher, text);
            };

            /**
             * Finds a matching handler method for a given dispatch context
             *
             * @param context
             */
            this.findHandler = function(context)
            {
                var handler = null;
                
                var guidRegex = new RegExp("^[0-9a-fA-F]{20}$");

                // walk through the routes and find one that matches this URI and method
                var discoveredMatches = [];
                for (var routeId in _this.routes)
                {
                    var route = _this.routes[routeId];
                    if (route.method === context.route.method)
                    {
                        var matchedTokens = _this.executeMatch(route.uri, context.route.uri);
                        if (matchedTokens)
                        {
                            var discoveredMatch = {};
                            discoveredMatch.handler = route.handler;
                            discoveredMatch.tokens = matchedTokens;
                            discoveredMatch.uri = route.uri;
                            discoveredMatch.method = route.method;
                            discoveredMatch.text = context.route.uri;
    
                            discoveredMatch.tokenCount = Object.keys(matchedTokens).length;
                            discoveredMatch.guidTokenCount = 0;
                            if (discoveredMatch.tokenCount > 0)
                            {
                                var guid = true;
                                for (var k in matchedTokens)
                                {
                                    var v = matchedTokens[k];
    
                                    if (!guidRegex.test(v))
                                    {
                                        guid = false;
                                    }
                                    else
                                    {
                                        discoveredMatch.guidTokenCount++;
                                    }
                                }
        
                                if (guid) {
                                    discoveredMatch.guid = true;
                                }
                            }
    
                            discoveredMatches.push(discoveredMatch);
                        }
                    }
                }
                
                // filter out any matches where the URIs are prefix substrings of other match URIs
                // (meaning that they are superdescribed or encapsulated by other URIs)
                if (discoveredMatches.length > 0)
                {
                    var discoveredMatchesByUri = {};
                    for (var d = 0; d < discoveredMatches.length; d++)
                    {
                        var discoveredMatch = discoveredMatches[d];
                        discoveredMatchesByUri[discoveredMatch.uri] = discoveredMatch;
                    }
                    
                    var discoveredMatchesKeys = Object.keys(discoveredMatchesByUri);
                    discoveredMatchesKeys = Ratchet.filterEncapsulatedValues(discoveredMatchesKeys);
    
                    discoveredMatches = [];
                    for (var d = 0; d < discoveredMatchesKeys.length; d++)
                    {
                        var k = discoveredMatchesKeys[d];
                        discoveredMatches.push(discoveredMatchesByUri[k]);
                    }
                }
                
                // break into two lists
                //      1) a list where we have token values consisting solely of guids
                //      2) a list where values are mixed (some guids and some not guids)
                //
                // and then for each of those lists, sort to give preference to most tokens with guids
                //
                // then concatenate
                //
                // the idea here is to give preference to any matches where exact IDs were found
                // and further to give preference to cases where the minimum set of tokens were extracted (allowing for exact matches on URI non-token, textual elements)
                //
                var list1 = [];
                var list2 = [];
                for (var d = 0; d < discoveredMatches.length; d++)
                {
                    var discoveredMatch = discoveredMatches[d];
                    if (discoveredMatch.guid) {
                        list1.push(discoveredMatch);
                    } else {
                        list2.push(discoveredMatch);
                    }
                }
                list1.sort(function(a, b) {
                    return b.guidTokenCount - a.guidTokenCount;
                });
                list2.sort(function(a, b) {
                    return b.guidTokenCount - a.guidTokenCount;
                });
                
                // compose back into discovered matches
                discoveredMatches = [];
                for (var z = 0; z < list1.length; z++) { discoveredMatches.push(list1[z]); }
                for (var z = 0; z < list2.length; z++) { discoveredMatches.push(list2[z]); }
                
                var discoveredHandler = null;
                var discoveredTokens = null;
                
                // keep the first entry
                if (discoveredMatches.length > 0)
                {
                    // discoveredHandler = discoveredMatches[discoveredMatches.length - 1].handler;
                    // discoveredTokens = discoveredMatches[discoveredMatches.length - 1].tokens;
                    discoveredHandler = discoveredMatches[0].handler;
                    discoveredTokens = discoveredMatches[0].tokens;
                }
    
                // find a matching handler method
                if (discoveredHandler)
                {
                    // create an invocation context
                    // this is a copy of the original context which will be used by the handler
                    //var invocationContext = new Ratchet.RenderContext(this, context.route, null, context.params);
                    var invocationContext = new Ratchet.RenderContext(this, context.route, null, context.params);
                    Ratchet.copyInto(invocationContext.model, context.model);
                    invocationContext.tokens = discoveredTokens;

                    // wrap the handler into a closure (convenience function)
                    handler = function(invocationContext)
                    {
                        return function(callback)
                        {
                            discoveredHandler.call(discoveredHandler, invocationContext, function(err) {
                                callback(err);
                            });
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

            /**
             * @return the top most ratchet instance in the parent chain
             */
            this.topRatchet = function()
            {
                var ratchet = this;
                while (ratchet.parent)
                {
                    ratchet = ratchet.parent;
                }

                return ratchet;
            };

            /**
             * @return whether the current ratchet is detached
             */
            this.isDetached = function()
            {
                return this.topRatchet().detached;
            };

            /**
             * Changes the hash bring routed.
             *
             * @param uri
             */
            this.dispatchUri = function(uri, cb) {

                var self = this;

                self.topRatchet().dispatchCompletionCount = 0;
                self.topRatchet().dispatchCount = 0;

                // restore the state from hash
                _this.dispatch({
                    "method": "GET",
                    "uri": uri
                }, {
                    "primary": true
                }, function(err, primary) {

                    if (cb) {
                        cb(err, primary);
                    }

                });
            };

            this.isBoundToWindowLocation = function()
            {
                return !this.parent && !this.isDetached();
            };

            // init
            this.init();
        },

        /**
         * The init method is called once when the dispatcher is started up.
         */
        init: function()
        {
            var self = this;

            // for the top-most dispatcher (handling the page), we bind a hashchange listener that
            // auto-updates the URI being dispatched from the hash
            if (self.isBoundToWindowLocation())
            {
                // make sure this only gets applied once
                if (!HASH_CHANGE_APPLIED)
                {
                    $(window).hashchange(function(e) {

                        var hash = self.autoAdjustHash.call(self, location.hash);
                        if (hash !== location.hash)
                        {
                            window.location.href = hash;
                            return;
                        }

                        self.dispatchUri(hash, function(err, primary) {
                            // completed

                            // allows for callback to be stored temporarily when a run() is called and the hashlink
                            // is toggled as a means of dispatching (see run method)
                            if (Ratchet.tempCallback)
                            {
                                Ratchet.tempCallback(err, primary);
                            }

                            Ratchet.tempCallback = null;

                        });
                    });

                    // only allow the hash change handler to be applied once
                    HASH_CHANGE_APPLIED = true;
                }
            }
        },

        /**
         * Extension Point
         *
         * @param hash
         * @returns {*}
         */
        autoAdjustHash: function(hash)
        {
            return hash;
        },

        /**
         * The setup function is called prior to the dispatch() method being invoked.
         * It is the inverse of the teardown method.
         */
        setup: function()
        {
            // claim the element by marking it with the ratchet id
            $(this.el).attr("ratchet", this.id);

            // invoke setup function
            if (this.setupFunction)
            {
                this.setupFunction.call(this);
            }

            // if the current element being set up is a "<region>" tag, then we instantly convert it to a proper DOM tag
            if ($(this.el)[0].nodeName.toLowerCase() == "region")
            {
                this.el = Ratchet.convertRegionTag(this.el);
            }

            // if the current element being set up is a "<gadget>" tag, then we instantly convert it to a proper DOM tag
            if ($(this.el)[0].nodeName.toLowerCase() == "gadget")
            {
                this.el = Ratchet.convertGadgetTag(this.el);
            }

            // if we don't have a gadget type, we should check the DOM to see if one is configured on the DOM element
            // to which we are bound
            if (!this.gadgetType)
            {
                this.gadgetType = $(this.el).attr("gadget");
                this.gadgetId = $(this.el).attr("id");
                this.gadgetStrategy = null;
            }

            // if there is a gadget configured for this dom element, boot it up
            if (this.gadgetType)
            {
                // if we don't have a gadget id, one will be generated inside of the gadgetRegistry.instantiate() call
                this.gadgetInstances = Ratchet.GadgetRegistry.instantiate(this.gadgetType, this.gadgetId, this);

                // if we had a gadget ID passed in and gadgetInstances length > 1, we trim back to keep first
                if (this.gadgetInstances.length > 1 && this.gadgetId)
                {
                    this.gadgetInstances.length = 1;
                }

                /*
                Ratchet.logDebug("Ratchet.setup() - Instantiated " + this.gadgetInstances.length + " gadget instances for type: " + this.gadgetType + " and id: " + this.gadgetId);
                */
                $.each(this.gadgetInstances, function(x, y) {
                    y.setup.call(y);
                });
            }

            Ratchet.Instances[this.id] = this;
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
            var _gadgetIds = [];
            $.each(this.childRatchets, function(_gadgetId, childRatchet) {
                _gadgetIds.push(_gadgetId);
            });
            for (var x = 0; x < _gadgetIds.length; x++) {
                delete this.childRatchets[_gadgetIds[x]];
            }
            this.childRatchets = {};

            // releases any subscribed observables
            //var a1 = this.subscriptions.length;
            $.each(this.subscriptions, function(callbackKey, observable) {
                observable.unsubscribe(callbackKey);
            });
            //Ratchet.logDebug("Ratchet.teardown() - Released " + a1 + " callback subscribers");

            // tear down any gadget instances
            //var l1 = this.gadgetInstances.length;
            $.each(this.gadgetInstances, function(i, gadgetInstance) {
                gadgetInstance.teardown();
            });
            //Ratchet.logDebug("Ratchet.teardown() - Removed " + l1 + " gadget instances");
            this.gadgetInstances = [];

            // releases any routes
            $.each(this.routes, function(i, route) {
                delete _this.routes[i];
            });
            this.routes = {};

            // remove the ratchet id from our dom element
            $(this.el).removeAttr("ratchet");

            // remove from cached instances
            delete Ratchet.Instances[this.id];
        },

        /**
         * Processes any downstream regions.
         */
        processRegions: function(context, callback)
        {
            var resolver = Ratchet.regionResolver;
            if (!resolver)
            {
                if (Ratchet.isUndefined(Ratchet.DefaultRegionResolver))
                {
                    Ratchet.error("No default region resolver available");
                    return;
                }
                else
                {
                    resolver = new Ratchet.DefaultRegionResolver("default");
                    Ratchet.regionResolver = resolver;
                }

            }

            //
            // find any sub-gadgets defined by tag
            //
            // these are:
            //
            //  <region id="<regionId>"></region>
            //
            $(context.closestDescendants('region')).each(function() {
                Ratchet.convertRegionTag(this);
                /*
                Ratchet.logDebug("Converted region tag: " + $(this).html());
                */
            });




            //
            // deal with an tagged sub-regions
            //
            // these are:
            //
            //  <div region="<regionId>"></div>
            //
            var _rarray = [];
            var regions = {};
            $(context.closestDescendants("[region]")).each(function()
            {
                var regionId = $(this).attr("region");
                regions[regionId] = this;
                _rarray.push(regionId);

                /*
                Ratchet.logDebug("Found region: " + regionId);
                */
            });

            // resolve all of these regions
            resolver.resolve.call(resolver, this, regions, function(resolutions) {

                /*
                Ratchet.logDebug("Resolved regions: " + JSON.stringify(_rarray) + " to: " + JSON.stringify(resolutions));
                */

                for (var regionId in resolutions)
                {
                    var resolutionArray = resolutions[regionId];
                    for (var z = 0; z < resolutionArray.length; z++)
                    {
                        var resolution = resolutionArray[z];

                        var gadgetType = resolution["type"];
                        var gadgetId = resolution["id"];
                        var attrs = resolution["attrs"];

                        // store a copy of the original dom attributes
                        var originalAttributes = {};
                        $(context.closestDescendants("[region=" + regionId + "]")[0]).each(function() {
                            $.each($(this)[0].attributes, function(index, attr) {
                                var name = attr.nodeName;
                                var value = null;
                                if (attr.value)
                                {
                                    value = attr.value;
                                }
                                else
                                {
                                    // legacy browser support
                                    value = attr.nodeValue;
                                }

                                originalAttributes[name] = value;
                            });
                        });

                        // build new tag
                        var tag = $("<div gadget='" + gadgetType + "'></div>");

                        // copy original dom attributes in, skipping any that we wouldn't want to keep
                        $.each(originalAttributes, function(k, v) {

                            // TODO: is there anything here we want to skip?
                            tag.attr(k, v);
                        });

                        // copy attributes dictated by the resolver
                        $.each(attrs, function(k, v) {
                            tag.attr(k, v);
                        });

                        // set gadget id
                        if (gadgetId)
                        {
                            tag.attr("id", gadgetId);
                        }

                        // store region info
                        if (regionId)
                        {
                            tag.attr("data-region", regionId);
                        }

                        // set strategy
                        tag.attr("gadget-strategy", "replace");

                        // substitute in
                        $(context.closestDescendants("[region=" + regionId + "]")[0]).replaceWith(tag);
                    }
                }

                // fire the callback
                if (callback)
                {
                    callback.call(this);
                }
            });
        },

        /**
         * Processes any downstream gadgets.
         */
        processGadgets: function(context, callback)
        {
            var _this = this;

            //
            // find any sub-gadgets defined by tag
            //
            // these are:
            //
            //  <gadget type="<gadgetType>" [strategy="<strategy>"]></gadget>
            //
            $(context.closestDescendants('gadget')).each(function() {
                Ratchet.convertGadgetTag(this);
                /*
                Ratchet.logDebug("Converted gadget tag: " + $(this).html());
                */
            });



            //
            // deal with an tagged sub-gadgets
            //
            // these are:
            //
            //  <div gadget="<gadgetType>"></div>
            //
            var params = {};
            $(context.closestDescendants("[gadget]")).each(function()
            {
                var subGadgetType = $(this).attr("gadget");
                var subGadgetId = $(this).attr("id");
                var subGadgetStrategy = $(this).attr("gadget-strategy");
                var subGadgetRegion = $(this).attr("data-region");

                /*
                Ratchet.logDebug("Processing sub-gadget [type=" + subGadgetType + ", id=" + subGadgetId + "]");
                */

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
                    /*
                    Ratchet.logDebug("Ratcheting sub-gadget [type=" + subGadgetType + ", id=" + subGadgetId + "]");
                    */

                    // instantiate a child ratchet on top of this element
                    var childRatchet = new Ratchet($(this), _this, function() {
                        this.gadgetType = subGadgetType;
                        this.gadgetId = subGadgetId;
                        this.gadgetStrategy = subGadgetStrategy;

                        if (subGadgetRegion) {
                            this.gadgetRegion = subGadgetRegion;
                        }
                    });

                    _this.childRatchets[childRatchet.id] = childRatchet;
                    subRatchetId = childRatchet.id;
                }

                // prepare any params
                params[subRatchetId] = {};
                $.each($(this)[0].attributes, function(i, attrib)
                {
                    var name = attrib.name;
                    var value = attrib.value;

                    if (value)
                    {
                        params[subRatchetId][name] = value;
                    }
                });
            });

            // if there are child ratchets, dispatch them
            // don't fire callback until all are complete
            if (_this.hasChildRatchets())
            {
                // do these in parallel
                var funcs = [];
                var count = 0;
                $.each(_this.childRatchets, function(childRatchetId, childRatchet)
                {
                    var f = (function(count, childRatchetId, childRatchet, context) {

                        return function(cb)
                        {
                            /*
                            Ratchet.logDebug("Dispatching child ratchet [id=" + childRatchetId + "] (" + context.route.method + " " + context.route.uri + "), gadget type: " + $(childRatchet.el).attr("gadget"));
                            */

                            var subParams = params[childRatchetId];

                            childRatchet.dispatch(context.route, subParams, function(err) {

                                // call back completion

                                count++;

                                /*
                                Ratchet.logDebug("Heard complete: " + count + " of: " + _this.childRatchetCount() + ", gadget type: " + $(childRatchet.el).attr("gadget"));
                                */

                                //Ratchet.nextTick(function() {
                                cb();
                                //});
                            });

                        };

                    })(count, childRatchetId, childRatchet, context);

                    count++;

                    funcs.push(f);
                });

                var dispatchMethod = "series";
                if (Ratchet.useParallelDispatch)
                {
                    dispatchMethod = "parallel";
                }

                Ratchet[dispatchMethod](funcs, function(err) {
                    //if (Ratchet.useHandlerCallbacks) {
                    if (_this.isUsingHandlerCallbacks()) {
                        if (callback) {
                            callback.call(this);
                        }
                    }
                });

                // fire the callback directly if callbacks not being used
                //if (!Ratchet.useHandlerCallbacks) {
                if (!_this.isUsingHandlerCallbacks()) {
                    if (callback) {
                        callback.call(this);
                    }
                }
            }
            else
            {
                // otherwise, no child ratchets, so we're done
                if (callback)
                {
                    callback.call(this);
                }
            }
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
                return function(el, callback) {
                    handler.call(that, el, callback);
                };
            }(that, handler);

            var routeId = method + "-" + uri + Ratchet.uniqueCount();

            this.routes[routeId] = {
                "uri": uri,
                "method": method,
                "handler": func
            };

            func.ratchetRouteId = routeId;

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
         * @param params
         * @param callback
         */
        dispatch: function(config, params, callback)
        {
            if (typeof(params) === "function")
            {
                callback = params;
                params = {};
            }
            if (!params)
            {
                params = {};
            }

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

            var isPrimary = true;
            var showPageTransition = true;

            if (params)
            {
                if (typeof(params["primary"]) !== "undefined")
                {
                    isPrimary = params["primary"];
                }

                if (typeof(params["showPageTransition"]) !== "undefined")
                {
                    showPageTransition = params["showPageTransition"];
                }
            }

            var context = null;
            if (isPrimary)
            {
                // create a temporary ratchet onto a temp div
                var tempEl = $("<div style='display:none'></div>");
                var tempRatchet = new Ratchet(tempEl, this);

                context = new Ratchet.RenderContext(tempRatchet, config, null, params);
            }
            else
            {
                context = new Ratchet.RenderContext(this, config, null, params);
            }

            // fire beforeDispatch event for ratchet
            $('body').trigger('beforeDispatch', [this, params]);

            // increment dispatch count
            this.incrementDispatchCount();

            // ensure authentication filter passes
            this.ensureAuthentication.call(this, context, function() {

                // callback that gets trigger once handler completes
                var handlerCompletionCallback = function(err)
                {
                    // if primary + we have a page transition block function
                    if (isPrimary && Ratchet.pageTransitionBlocker && showPageTransition)
                    {
                        Ratchet.pageTransitionBlocker(false);
                    }

                    // if the "temp-wrapper" remains strayed up at the top, we remove it here
                    if (isPrimary)
                    {
                        // remove the extra "temp-wrapper" div that ends up at the top
                        var d = $(_this.el).children()[0];
                        if ($(d).hasClass("temp-wrapper"))
                        {
                            var children = $(d).children();
                            $(_this.el).append(children);
                            $(d).remove();
                        }
                    }

                    if (callback)
                    {
                        callback(err, isPrimary);
                    }
                };

                // allow for before dispatch
                _this.beforeDispatch(config, params, context, function() {

                    // find the controller handler method that matches this uri
                    var wrappedHandler = _this.findHandler(context);
                    if (wrappedHandler)
                    {
                        // if primary + we have a page transition block function
                        if (isPrimary && Ratchet.pageTransitionBlocker && showPageTransition)
                        {
                            Ratchet.pageTransitionBlocker(true);
                        }

                        // remove the ratchet-completed class
                        $(_this.el).removeClass("ratchet-completed");

                        // invoke the handler
                        wrappedHandler(function(err) {

                            if (_this.isUsingHandlerCallbacks())
                            {
                                handlerCompletionCallback(err);
                            }

                            // first afterHandle custom event
                            $('body').trigger('afterHandle', [_this, _this.isDispatchCompleted()]);

                        });

                        //return;
                    }

                    // if we're not using completion callbacks, then callback right away
                    if (!_this.isUsingHandlerCallbacks() || !wrappedHandler)
                    {
                        handlerCompletionCallback();
                    }

                });

            }, function() {

                alert("Authentication failed - not authenticated");

                if (callback)
                {
                    callback({
                        "message": "Authentication failed"
                    });
                }

            });
        },

        /**
         * Allows for custom logic to be hooked in ahead of dispatching to a URL.
         *
         * @param config
         * @param params
         * @param context
         * @param callback
         */
        beforeDispatch: function(config, params, context, callback)
        {
            callback();
        },

        /**
         * Runs a route.
         *
         * @param [String] method assumes GET
         * @param {String} uri
         * @param [Object] data
         * @param [Function] callback
         */
        run: function()
        {
            var self = this;

            var config = {
                "method": "GET",
                "data": {}
            };

            var callback = null;

            var forceTriggerHashChange = false;

            var args = Ratchet.makeArray(arguments);
            if (args.length === 1)
            {
                var uri = args.shift();
                if (typeof(uri) === "function")
                {
                    callback = uri;
                    uri = null;
                    args = [];
                }
                if (uri)
                {
                    config.uri = uri;
                }
            }

            if (args.length === 0)
            {
                if (!config.uri)
                {
                    var uri = window.location.href;
                    if (uri.indexOf("#") > -1)
                    {
                        uri = uri.substring(uri.indexOf("#") + 1);

                        forceTriggerHashChange = true;
                    }
                    else
                    {
                        uri = self.DEFAULT_URI;
                    }
                    config.uri = uri;
                }
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

                    if (typeof(config.data) === "function")
                    {
                        callback = config.data;
                        config.data = null;
                    }
                }
            }
            else if (args.length == 3)
            {
                config.method = args.shift();
                config.uri = args.shift();
                config.data = args.shift();

                if (typeof(config.data) === "function")
                {
                    callback = config.data;
                    config.data = null;
                }
            }
            else if (args.length == 4)
            {
                config.method = args.shift();
                config.uri = args.shift();
                config.data = args.shift();
                callback = args.shift();
            }

            // if we're the top dispatcher (app scope) and we're doing a get, store onto history
            // this lets the history callback make the dispatch for us
            if (config.method === "GET" && this.isBoundToWindowLocation())
            {
                // if we have a callback, store it in a temp place so that the hashchange listener can pick it up
                if (callback)
                {
                    Ratchet.tempCallback = callback;
                }

                // clean up URI
                if (Ratchet.startsWith(config.uri, "#"))
                {
                    config.uri = config.uri.substring(1);
                }

                // change hash which triggers the hashchange handler
                window.location.hash = "#" + config.uri;

                // or if we are meant to force change it, we do that here
                if (forceTriggerHashChange)
                {
                    $(window).hashchange();
                }
            }
            else
            {
                // we're either running a non-GET method or we're not bound to the window
                // dispatch directly

                var primary = true;
                var showPageTransition = true;
                if (config.data)
                {
                    if (typeof(config.data.primary) !== "undefined")
                    {
                        primary = config.data.primary;
                    }

                    if (typeof(config.data.showPageTransition) !== "undefined")
                    {
                        showPageTransition = config.data.showPageTransition;
                    }
                }

                this.dispatch(config, {
                    "primary": primary,
                    "showPageTransition": showPageTransition
                }, function(err, primary) {

                    if (callback)
                    {
                        callback(err, primary);
                    }
                });
            }
        },

        /**
         * Refreshes the current route.
         */
        refresh: function(callback)
        {
            this.run(function() {

                if (callback)
                {
                    callback();
                }
            });
        },


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // OBSERVABLES
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        subscribe: function()
        {
            return Ratchet.subscribe.apply(this, arguments);
        },

        unsubscribe: function()
        {
            return Ratchet.unsubscribe.apply(this, arguments);
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
            return Ratchet.Events.on.apply(this, arguments);
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
            return Ratchet.Events.off.apply(this, arguments);
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
            this.addAuthPattern(pattern);
        },

        /**
         * Marks a URI patterns as requiring authentication.  Supports wildcards.
         *
         * @param pattern
         */
        addAuthPattern: function(pattern)
        {
            this.authPatterns.push(pattern);
        },

        /**
         * Marks a URI patterns as not requiring authentication.  Supports wildcards.
         *
         * @param pattern
         */
        addNoAuthPattern: function(pattern)
        {
            this.noAuthPatterns.push(pattern);
        },

        /**
         * Marks a URI patterns as not requiring authentication.  Supports wildcards.
         *
         * @param pattern
         */
        addGuestAuthPattern: function(pattern)
        {
            this.guestAuthPatterns.push(pattern);
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

            // is this a URL that requires non-guest authentication?
            var tripUserAuthPattern = false;
            for (var i = 0; i < this.authPatterns.length; i++)
            {
                var pattern = this.authPatterns[i];

                var tokens = this.executeMatch(pattern, context.route.uri);
                if (tokens)
                {
                    tripUserAuthPattern = true;
                }
            }

            // is this a URL that allows guest authentication?
            var tripGuestAuthPattern = false;
            for (var i = 0; i < this.guestAuthPatterns.length; i++)
            {
                var pattern = this.guestAuthPatterns[i];

                var tokens = this.executeMatch(pattern, context.route.uri);
                if (tokens)
                {
                    tripGuestAuthPattern = true;
                }
            }

            // is this a URL that allows no authentication?
            var tripNoAuthPattern = false;
            for (var i = 0; i < this.noAuthPatterns.length; i++)
            {
                var pattern = this.noAuthPatterns[i];

                var tokens = this.executeMatch(pattern, context.route.uri);
                if (tokens)
                {
                    tripNoAuthPattern = true;
                }
            }


            // if we tripped "required authentication" and didn't trip "required no authentication"
            // then redirect for a sign in
            if (!tripNoAuthPattern)
            {
                // we need to authenticate - either as "guest" or as an actual user
                var methodName = "authenticateGuest";
                if (tripUserAuthPattern) {
                    methodName = "authenticateUser";
                }

                // if we have a plugin authenticator, we use that
                if (this.authenticator && this.authenticator[methodName])
                {
                    this.authenticator[methodName](context, function() {

                        successCallback();

                    }, function() {

                        failureCallback();

                    });
                }
                else
                {
                    // otherwise, we call our direct methods
                    this[methodName].call(_this, context, function() {

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
        authenticateUser: function(context, successCallback, failureCallback)
        {
            // default logic, just fire back
            successCallback();
        },

        /**
         * @extension_point
         *
         * This gets called when a decision has been made to automatically sign on with guest authentication.
         * This method should first check whether authentication already exists and if so, just fire the callback.
         *
         * @param context
         * @param successCallback
         * @param failureCallback
         */
        authenticateGuest: function(context, successCallback, failureCallback)
        {
            // default logic, just fire back
            successCallback();
        },


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // SELECTORS AND DOM MANIPULATION
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Selects a subratchet.
         *
         * @param selector
         * @return {*}
         */
        select: function(selector)
        {
            var ratchet = null;

            var parent = this.topRatchet();

            for (var childRatchetId in parent.childRatchets)
            {
                var childRatchet = parent.childRatchets[childRatchetId];
                if (childRatchet.gadgetType == selector)
                {
                    ratchet = childRatchet;
                    break;
                }
            }

            return ratchet;
        },

        hide: function()
        {
            $(this.el).css("display", "none");
        },

        show: function()
        {
            $(this.el).css("display", "block");
        },

        findGadget: function(type, id)
        {
            var instance = null;

            for (var i = 0; i < this.gadgetInstances.length; i++)
            {
                var gi = this.gadgetInstances[i];

                if (gi.type == type && gi.id == id)
                {
                    instance = gi;
                    break;
                }
            }

            return instance;
        }

    });

    /**
     * Converts the current "gadget" tag to a tag-represented version (i.e. <div gadget="<gadget>"/>
     */
    Ratchet.convertGadgetTag = function(domEl)
    {
        var tag = $(domEl).attr("tag");
        if (!tag)
        {
            tag = "div";
        }

        var type = $(domEl).attr("type");

        // build the replacement tag
        var tag = $("<" + tag +" gadget='" + type + "'></" + tag + ">");

        // copy attributes
        $.each($(domEl)[0].attributes, function(index, attr) {
            var name = attr.nodeName;
            var value = null;
            if (attr.value)
            {
                value = attr.value;
            }
            else
            {
                // legacy browser support
                value = attr.nodeValue;
            }

            if (name == "strategy") {
                name = "gadget-strategy";
            }

            if (name == "tag" || name == "type")
            {
                // these don't get copied
            }
            else
            {
                $(tag).attr(name, value);
            }
        });

        // assign temp key
        var tempKey = "temp-" + new Date().getTime();
        $(tag).attr("tempkey", tempKey);

        // copy inner html
        $(tag).html($(domEl).html());

        var parent = $(domEl).parent();

        $(domEl).replaceWith(tag);

        tag = $(parent).children("[tempkey=" + tempKey + "]")[0];
        $(tag).removeAttr("tempkey");

        return tag;
    };

    /**
     * Converts the current "region" tag to a tag-represented version (i.e. <div region="<region>"/>
     */
    Ratchet.convertRegionTag = function(domEl)
    {
        var tag = $(domEl).attr("tag");
        if (!tag)
        {
            tag = "div";
        }

        // convert some region tags to gadgets
        var regionId = $(domEl).attr("id");

        // build the replacement tag
        var tag = $("<" + tag +" region='" + regionId + "'></" + tag + ">");

        // assign temp key
        var tempKey = "temp-" + new Date().getTime();
        $(tag).attr("tempkey", tempKey);

        $.each($(domEl)[0].attributes, function(index, attr) {
            var name = attr.nodeName;
            var value = null;
            if (attr.value)
            {
                value = attr.value;
            }
            else
            {
                // legacy browser support
                value = attr.nodeValue;
            }

            if (name == "tag" || name == "region")
            {
                // these don't get copied
            }
            else
            {
                $(tag).attr(name, value);
            }
        });

        var parent = $(domEl).parent();

        $(domEl).replaceWith(tag);

        tag = $(parent).children("[tempkey=" + tempKey +"]")[0];
        $(tag).removeAttr("tempkey");

        return tag;
    };



    ///////////////////////////////////////////////////////////////////////////////////////////
    //
    // ADDITIONAL NAMESPACES FOR CUSTOM EXTENSIONS
    //
    ///////////////////////////////////////////////////////////////////////////////////////////

    if (typeof Ratchet.Gadgets === "undefined") {
        Ratchet.Gadgets = {};
    }

    if (typeof Ratchet.Pages === "undefined") {
        Ratchet.Pages = {};
    }

    if (typeof Ratchet.Utils === "undefined") {
        Ratchet.Utils = {};
    }

    if (typeof Ratchet.Authenticators === "undefined") {
        Ratchet.Authenticators = {};
    }



    ///////////////////////////////////////////////////////////////////////////////////////////
    //
    // LOGGER
    //
    ///////////////////////////////////////////////////////////////////////////////////////////

    // log levels
    Ratchet.DEBUG = 0;
    Ratchet.INFO = 1;
    Ratchet.WARN = 2;
    Ratchet.ERROR = 3;

    // by default, logging only shows errors
    // to debug, set Ratchet.logLevel = Ratchet.DEBUG
    Ratchet.logLevel = Ratchet.ERROR;

    Ratchet.logDebug = function(obj) {
        Ratchet.log(Ratchet.DEBUG, obj);
    };
    Ratchet.logInfo = function(obj) {
        Ratchet.log(Ratchet.INFO, obj);
    };
    Ratchet.logWarn = function(obj) {
        Ratchet.log(Ratchet.WARN, obj);
    };
    Ratchet.logError = function(obj, includeStack) {
        Ratchet.log(Ratchet.ERROR, obj);
        if (includeStack)
        {
            console.log(Ratchet.ERROR, new Error().stack);
        }
    };

    Ratchet.isDebug = function() {
        return Ratchet.logLevel === Ratchet.DEBUG;
    };

    Ratchet.log = function(level, obj) {

        var methodMap = {
            0: 'debug',
            1: 'info',
            2: 'warn',
            3: 'error'
        };

        if (Ratchet.logLevel <= level)
        {
            var method = methodMap[level];
            if (typeof console !== 'undefined' && console[method])
            {
                console[method].call(console, obj);
            }
        }
    };

    // this should be false for Cloud CMS console (for now)
    Ratchet.useHandlerCallbacks = false;

    // this can be used to have child ratchets process in parallel
    Ratchet.useParallelDispatch = false;

    // page transition blocker
    Ratchet.pageTransitionBlocker = null;

    // class for fade ins of modals
    Ratchet.defaultModalFadeClass = "fade";
    
    var cached_regexps = {};
    
    /**
     * Matches comes in like:
     *
     *      /**
     *      /projects/{projectId}/documents/{documentId}
     *
     * Convert to:
     *
     *      /(.*)
     *      /projects/(.*)/documents/(.*)
     *
     * Along with a map that maps the matches back to their tokens:
     *
     *      0 -> **
     *
     * Or
     *
     *      0 -> projectId
     *      1 -> documentId
     *
     * @param matcher
     * @param text
     *
     * @returns {{}|null}
     */
    Ratchet.executeMatch = function(matcher, text)
    {
        // strip matcher from "/a/b/c" to "a/b/c"
        if (matcher && matcher.length > 0 && matcher.substring(0,1) === "/")
        {
            matcher = matcher.substring(1);
        }
        
        // strip text from "/a/b/c" to "a/b/c"
        if (text && text.length > 0 && text.substring(0,1) === "/")
        {
            text = text.substring(1);
        }
        
        // check for early exact match
        if (matcher === text) {
            return {};
        }
        
        // if matcher is **, then always match
        if (matcher === "**") {
            return {
                "**": text
            };
        }
        
        var entry = cached_regexps[matcher];
        if (!entry)
        {
            // suppose the string comes in like this
            // a/b/**/c/{d}/{e}/f/g
            
            // build regex string
            var regexString = matcher.replaceAll("**", "(.*)");
        
            // now it looks like
            // a/b/(.*)/c/{d}/{e}/f/g
            
            var i = 0;
            while (i < regexString.length)
            {
                var c = regexString[i];
                
                if (c === "{")
                {
                    var z = regexString.indexOf("}", i);
                    if (z > -1)
                    {
                        var token = regexString.substring(i, z + 1);
                        regexString = regexString.substring(0, i) + "(.*)" + regexString.substring(z + 1);
                        i = i + 3;
                    }
                }
                
                i++;
            }
        
            // and now it looks like
            // a/b/(.*)/c/(.*)/(.*)/f/g
            
            // add front and end delimiters
            regexString = "^" + regexString + "$";
            
            // now looks like
            // a/b/(.*)/c/(.*)/(.*)/f/g
            
            // compile to regex
            var regex = new RegExp(regexString);
            
            // and run over ourselves to pop out the token match indexes
            var tokenKeys = matcher.match(regex);
            
            // lop off the first token
            if (tokenKeys.length > 0) {
                tokenKeys.shift();
            }
    
            // tokens will look lke
            // ["**", "{d}", "{e}"]
    
            // remove the { and } characters from the token keys array
            for (var i = 0; i < tokenKeys.length; i++)
            {
                if (tokenKeys[i].startsWith("{") && tokenKeys[i].endsWith("}"))
                {
                    tokenKeys[i] = tokenKeys[i].substring(1);
                    tokenKeys[i] = tokenKeys[i].substring(0, tokenKeys[i].length - 1);
                }
            }
    
            entry = {};
            entry.regex = regex;
            entry.tokenKeys = tokenKeys;
            
            cached_regexps[matcher] = entry;
        }
    
        var regex = entry.regex;
        var tokenKeys = entry.tokenKeys;
    
        // is this a match?
        var test = regex.test(text)
        if (!test)
        {
            return null;
        }

        // build a tokens map to hand back
        var tokens = {};
        
        // extract the token values
        var tokenValues = text.match(regex);
        // lop off the first entry
        if (tokenValues.length > 0) {
            tokenValues.shift();
        }
        for (var i = 0; i < tokenKeys.length; i++)
        {
            var tokenKey = tokenKeys[i];
            var tokenValue = tokenValues[i];
            if (tokenValue)
            {
                tokens[tokenKey] = tokenValue;
            }
        }
        
        //printDebug();
        return tokens;
    };
    
    Ratchet.Instances = {};

    Ratchet.findInstance = function(ratchetId)
    {
        return Ratchet.Instances[ratchetId];
    };

    Ratchet.findClosestBoundRatchet = function(el)
    {
        var ratchetId = $(el).attr("ratchet");
        if (ratchetId)
        {
            var ratchetInstance = Ratchet.Instances[ratchetId];
            if (ratchetInstance)
            {
                return ratchetInstance;
            }
        }
        else
        {
            var parent = $(el).parent();
            if (parent && parent.length > 0)
            {
                return Ratchet.findClosestBoundRatchet(parent);
            }
        }

        return null;
    };
    
    /**
     * Strips out any values where those values are prefixed subsets of other values in the array.
     *
     * For example, given a set of prefixes such as:
     *
     *      [
     *          "/projects/{projectId}",
     *          "/projects/{projectId}/content"
     *      ]
     *
     * This filters the array to
     *
     *      [
     *          "/projects/{projectId}/content"
     *      ]
     *
     * Since "/projects/{projectId}" is a prefix substring of another key, "/projects/{projectId}/content".
     *
     * This method works by inserting all keys into a tree structure (where each level of the tree is a character in the key).
     * The retained values are then reconstructed by walking the tree to depth.  This filters out any keys that are
     * described by larger or containing keys.
     *
     * @param keys
     */
    Ratchet.filterEncapsulatedValues = function(keys)
    {
        var insert = function(entry, key)
        {
            var root = entry;
            for (var i = 0; i < key.length; i++)
            {
                var c = key.substring(i, i + 1);
                
                if (!root.children) {
                    root.children = {};
                }
                if (!root.children[c]) {
                     root.children[c] = {};
                }
                
                root = root.children[c];
            }
        }
    
        // collects the results
        var collect = function(root, str, results)
        {
            // If node is leaf node, it indicates end
            // of String, so a null character is added
            // and String is displayed
            if (!root.children)
            {
                results.push(str);
            }
            else
            {
                for (var c in root.children)
                {
                    collect(root.children[c], "" + str + c, results);
                }
            }
        }
    
        let root = {};
        
        // insert keys
        for (let i = 0; i < keys.length; i++) {
            insert(root, keys[i]);
        }
        
        var results = [];
        collect(root, "", results);
    
        return results;
    }

})(jQuery);