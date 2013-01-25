(function($)
{
    Ratchet.RenderContext = Base.extend(
    {
        constructor: function(ratchet, routeContext, domEl, params)
        {
            this.base();

            var container = $("<div></div>");
            if (domEl)
            {
                container.html($(domEl).html());
            }

            // copy container properties into this
            jQuery.extend(this, container, { "route" : routeContext });


            // privileged methods

            this.ratchet = function()
            {
                return ratchet;
            };

            this.topRatchet = function()
            {
                return this.ratchet().topRatchet();
            };

            this._getContainer = function()
            {
                return container;
            };

            // Fix for IE 8
            this.children = function()
            {
                return container.children();
            };

            this.model = {};
            this.params = (params ? params : {});
        },

        swap: function(callback)
        {
            var self = this;

            // process any regions
            self.ratchet().processRegions.call(self.ratchet(), self, function() {

                // process any gadgets

                // dispatcher post-render
                self.ratchet().processGadgets.call(self.ratchet(), self, function () {

                    var postSwap = function(onComplete)
                    {
                        // fire post-swap custom event
                        $('body').trigger('swap', [self.ratchet()]);

                        // increment dispatch completion count
                        self.ratchet().incrementDispatchCompletionCount();

                        // fire post-dispatch custom event
                        $('body').trigger('dispatch', [self.ratchet(), self.ratchet().isDispatchCompleted()]);

                        if (onComplete) {
                            onComplete.call(self);
                        }
                    };


                    //
                    // we support three strategies:
                    //
                    //   "insert" - the rendered nodes become children of the ratchet el
                    //   "replace" - the ratchet el is removed and replaced entirely by rendered nodes
                    //               if there is only one top-child, then it is merged with attributes of the ratchet el
                    //

                    // assume we are going to insert
                    var strategy = this.gadgetStrategy;
                    if (!strategy) {
                        strategy = "insert";
                    }

                    if (strategy == "replace")
                    {
                        // look through the rendered children to see if we can find a merge point
                        // a merge point means that there is just one top-most rendered child
                        // if we find one, then we'll merge attributes from ratchet el to merge point

                        var mergePoint = null;

                        // we must have some DOM children in order for there to be a merge point
                        if (self.children().size() > 0)
                        {
                            // get rid of any white space nodes
                            var index = 0;
                            while (index < self[0].childNodes.length)
                            {
                                var current = self[0].childNodes[index];
                                if (current.nodeName == "#text")
                                {
                                    if (current.textContent.trim() == 0)
                                    {
                                        self[0].removeChild(current);
                                    }
                                    else
                                    {
                                        index++;
                                    }
                                }
                                else
                                {
                                    index++;
                                }
                            }

                            // if the DOM element is now FIRST, then use it as merge point
                            // AND if there is only one child
                            if (self[0].childNodes[0].nodeName.toLowerCase() == self.children()[0].nodeName.toLowerCase())
                            {
                                if (self.children().size() == 1)
                                {
                                    // just one child node (which is a dom node), so use it as a merge point
                                    mergePoint = self.children()[0];
                                }
                            }
                        }

                        // if we have a merge point, then we'll remove the ratchet el and fully recreate
                        if (mergePoint)
                        {
                            // use dom type of the mergepoint
                            // but if original is BODY, then we preserve
                            var name = $(mergePoint)[0].nodeName;
                            if ($(self.ratchet().el)[0].nodeName.toLowerCase() == "body")
                            {
                                name = "body";
                            }

                            // target element
                            var newEl = $("<" + name + "></" + name + ">");

                            // copy original attributes to target (such as class and id)
                            var attributes = $(self.ratchet().el)[0].attributes;
                            $.each(attributes, function() {
                                if (this.name == "gadget" || this.name == "gadget-strategy")
                                {
                                    // skip these
                                }
                                else
                                {
                                    $(newEl).attr(this.name, this.value);
                                }
                            });

                            // copy mergepoint attributes to target
                            var attributes = $(mergePoint).prop("attributes");
                            $.each(attributes, function() {
                                $(newEl).attr(this.name, this.value);
                            });

                            // copy mergepoint children to target
                            $(newEl).append($(mergePoint)[0].childNodes);

                            // set a temp key so we can look up after replace
                            var tempKey = "tempkey-" + new Date().getTime();
                            $(newEl).attr("tempkey", tempKey);

                            // replace in DOM
                            var parent = $(self.ratchet().el).parent();
                            $(self.ratchet().el).replaceWith(newEl);
                            // now find what we replaced and clean up
                            newEl = $(parent).find("[tempkey=" + tempKey + "]");
                            $(newEl).removeAttr("tempkey");

                            // now update the ratchet "el" reference
                            self.ratchet().el = $(newEl)[0];

                            // all done
                            postSwap(function() {
                                if (callback)
                                {
                                    callback.call(self);
                                }
                            });
                            return;
                        }

                        // otherwise, we simply replace the ratchet el with all children
                        // i.e. no merge

                        // remember the original attributes
                        var originalAttributes = {};
                        $.each($(self.ratchet().el)[0].attributes, function() {
                            if (this.name == "gadget-strategy")
                            {
                                // skip these
                            }
                            else
                            {
                                originalAttributes[this.name] = this.value;
                            }
                        });

                        // we'll use these to replace the current el
                        var replacements = $($(self)[0].childNodes);

                        // swap in replacements
                        $(self.ratchet().el).replaceWith(replacements);

                        // now update the ratchet "el" reference
                        self.ratchet().el = null;

                        postSwap(function() {

                            // if swapping in multiple DOM elements, apply ratchet and gadget tags up to the parent
                            if ($(replacements).children().length > 1) {
                                $(replacements).parent().attr("gadget", originalAttributes["gadget"]);
                                $(replacements).parent().attr("ratchet", originalAttributes["ratchet"]);
                            }

                            // if we really only have one dom element that serves as a replacement
                            // i.e. getting rid of all text (comments)
                            if ($(replacements).filter("*").length == 1)
                            {
                                // then copy original dom attributes (from gadget tag) back to replacement node
                                var replacement = $($(replacements).filter("*")[0]);
                                $.each(originalAttributes, function(name, value) {

                                    if (name == "id")
                                    {
                                        // skip these
                                    }
                                    else
                                    {
                                        if (!$(replacement).attr(name)) {
                                            $(replacement).attr(name, value);
                                        }
                                    }
                                });
                            }


                            if (callback)
                            {
                                callback.call(self);
                            }
                        });

                        return;
                    }


                    // default behavior (insert)

                    // clear the live element
                    $(self.ratchet().el).html("");

                    // append the children from the in-memory swap copy
                    $(self.ratchet().el).append($(self)[0].childNodes);

                    // all done
                    postSwap(function() {
                        if (callback)
                        {
                            callback.call(self);
                        }
                    });
                });
            });
        },

        /**
         * Fetches JSON data from a URL.
         *
         * @param {String} url the url
         * @param [Object] options ajax options
         * @param {Function} successCallback
         * @param [Function] failureCallback
         */
        fetch: function()
        {
            var _this = this;

            var args = Ratchet.makeArray(arguments);

            var url = args.shift();
            var options = null;
            var successCallback = null;
            var failureCallback = null;

            var a1 = args.shift();
            if (Ratchet.isFunction(a1))
            {
                successCallback = a1;
                failureCallback = args.shift();
            }
            else
            {
                options = a1;
                successCallback = args.shift();
                failureCallback = args.shift();
            }

            if (!options)
            {
                options = {};
            }

            var isJson = (url.match(/\.json$/) || options.json);

            $.ajax($.extend({
                "url": url,
                "data": {},
                "dataType": (isJson ? "json" : null),
                "type": "get",
                "success": function(data)
                {
                    if (successCallback)
                    {
                        successCallback.call(successCallback, _this, data);
                    }
                },
                "failure": function(http)
                {
                    if (failureCallback)
                    {
                        failureCallback.call(failureCallback, _this, http);
                    }
                }
            }, options));
        },

        /**
         * Transforms a template at a given URI with the provided model.
         *
         * @param {String} templateIdentifier template (either HTML fragment, URI or a #dom id selector)
         * @param [Object] model data model
         * @param {Function} successCallback
         * @param [Function] failureCallback
         */
        transform: function(templateIdentifier, data, successCallback, failureCallback)
        {
            var _this = this;

            var args = Ratchet.makeArray(arguments);

            var templateIdentifier = args.shift();
            var model = this.model;
            var successCallback = null;
            var failureCallback = null;

            var a1 = args.shift();
            if (Ratchet.isFunction(a1))
            {
                successCallback = a1;
                failureCallback = args.shift();
            }
            else
            {
                data = a1;
                Ratchet.copyInto(model, data);
                successCallback = args.shift();
                failureCallback = args.shift();
            }

            // NOTE: this requires a template engine
            var engine = null;
            if (Ratchet.renditionEngineId)
            {
                engine = Ratchet.TemplateEngineRegistry.find(Ratchet.renditionEngineId);
                if (!engine)
                {
                    Ratchet.error("Unable to find desired rendition engine (Ratchet.renditionEngineId): " + Ratchet.renditionEngineId);
                    return;
                }
            }
            else
            {
                // pick the first thing we find from the registered engines
                var ids = Ratchet.TemplateEngineRegistry.getIds();
                for (var i = 0; i < ids.length; i++)
                {
                    engine = Ratchet.TemplateEngineRegistry.find(ids[i]);
                }

                if (!engine)
                {
                    Ratchet.error("Unable to find a default rendition engine as none are configured");
                    return;
                }
            }

            // determine whether this is HTML, a template URI or a dom element selector (#)
            var renderType = "url"; // assume url
            var renderValue = templateIdentifier;
            var renderCacheKey = null;
            if (templateIdentifier.indexOf("#") == 0) {
                renderType = "selector";
            }
            else if (templateIdentifier.indexOf("<") > -1 || templateIdentifier.indexOf(" ") > -1) {
                renderType = "html";
            }

            // render
            engine.render(_this, renderType, renderValue, renderCacheKey, model, function(el) {

                if (successCallback)
                {
                    successCallback(el);
                }

            }, function(el, http) {

                if (failureCallback)
                {
                    failureCallback(el, http);
                }

            });
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

            var callbackKey = this.id;

            return this.ratchet().observable(scope, id, callbackKey, callbackFunction);
        },

        /**
         * Interceptor method that just does a pass thru
         */
        dependentObservable: function()
        {
            return this.ratchet().dependentObservable.apply(this.ratchet(), arguments);
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
            this.ratchet().observable(scope, id, func);
        },

        /**
         * Run
         *
         * @param [String] method assumes GET
         * @param {String} uri
         * @param [Object] data
         */
        run: function()
        {
            this.ratchet().run.apply(this.ratchet(), arguments);
        }

    });

})(jQuery);