(function($)
{
    /**
     * Morphs the children of a ratchet's live element into the freshly rendered nodes in `container`.
     *
     * Unlike "insert", which empties the live element and appends the rendered nodes, this keeps any live nodes
     * that match the rendered ones (updating their attributes and content in place) and only adds, removes or
     * changes what differs, so the browser doesn't redo layout for the whole gadget and scroll position and
     * focus survive.
     *
     * Because matched live nodes survive, event handlers bound to them survive too. Gadgets that re-bind their
     * handlers on every render must do so idempotently (e.g. off() before on()) or use delegated events.
     * Likewise, handlers or data attached to the rendered nodes before swap() are lost wherever a live node is
     * kept in their place.
     *
     * Child gadgets are the exception: their roots are replaced by the rendered nodes rather than morphed. Children
     * are dispatched into the rendered nodes before this runs (and without Ratchet.useHandlerCallbacks, may already
     * have run their after-swap code there), so they hold references to those nodes and have built widgets and
     * bound handlers on them. Morphing would leave all of that off-screen, so each child's subtree is swapped in
     * as-is, exactly as "insert" would, while the layout around the children still morphs.
     */
    var morphChildren = function(ratchet, container)
    {
        var liveEl = $(ratchet.el)[0];

        // the rendered roots of our child gadgets (a "replace" child's el can be several nodes)
        var childRoots = new Set();
        for (var id in ratchet.childRatchets)
        {
            $(ratchet.childRatchets[id].el).each(function() {
                if (this.nodeType === 1) {
                    childRoots.add(this);
                }
            });
        }

        // rendered node -> the live node it was morphed into
        var morphed = new Map();

        // [live node, rendered child root] pairs to swap once the morph is done
        var replacements = [];

        Ratchet.morphdom(liveEl, container, {
            childrenOnly: true,
            onBeforeElUpdated: function(fromEl, toEl) {
                if (childRoots.has(toEl)) {
                    replacements.push([fromEl, toEl]);
                    return false;
                }
                morphed.set(toEl, fromEl);
                return true;
            },
            onNodeDiscarded: function(node) {
                // what html("") would have done: release jQuery data and handlers (firing "destroyed")
                if (node.nodeType === 1) {
                    $.cleanData([node]);
                }
            }
        });

        // swap in the child gadgets (replaceWith also releases the old nodes' jQuery data and handlers)
        for (var i = 0; i < replacements.length; i++)
        {
            $(replacements[i][0]).replaceWith(replacements[i][1]);
        }

        // anything else rendered into the (now discarded) rendered nodes gets pointed at the live ones
        var remap = function(el)
        {
            if (el && el.nodeType) {
                return morphed.get(el) || el;
            }
            if (el && el.jquery) {
                return $($.map(el.toArray(), remap));
            }
            return el;
        };
        var remapChildren = function(r)
        {
            for (var id in r.childRatchets)
            {
                var child = r.childRatchets[id];
                child.el = remap(child.el);
                remapChildren(child);
            }
        };
        remapChildren(ratchet);
    };

    Ratchet.RenderContext = Base.extend(
    {
        constructor: function(ratchet, routeContext, domEl, params)
        {
            this.base();

            // create a fragment
            // var frag = document.createDocumentFragment();
            // var container = document.createElement("div");
            // container.classList.add("temp-wrapper");
            // frag.appendChild(container);

            var container = $("<div class='temp-wrapper'></div>");
            if (domEl)
            {
                // copy the current dom by cloning nodes rather than serializing to html and parsing it back
                var source = $(domEl)[0];
                if (source)
                {
                    for (var child = source.firstChild; child; child = child.nextSibling)
                    {
                        container[0].appendChild(child.cloneNode(true));
                    }
                }
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

            /*
            Ratchet.logDebug("swap() calling into processRegions()");
            */

            // process any regions
            self.ratchet().processRegions.call(self.ratchet(), self, function() {

                // process any gadgets
                /*
                Ratchet.logDebug("swap() processRegions complete");
                Ratchet.logDebug("swap() calling into processGadgets()");
                */

                // dispatcher post-render
                self.ratchet().processGadgets.call(self.ratchet(), self, function () {

                    /*
                    Ratchet.logDebug("swap() processGadgets complete");
                    */

                    var postSwap = function(onComplete)
                    {
                        // mark the element as complete
                        $(self.ratchet().el).addClass("ratchet-completed");

                        // fire post-swap custom event
                        $('body').trigger('swap', [self.ratchet()]);

                        // increment dispatch completion count
                        self.ratchet().incrementDispatchCompletionCount();

                        // fire post-dispatch custom event
                        // console.log("Dispatch Completion Count: " + self.topRatchet().dispatchCompletionCount);
                        // console.log("Dispatch Count: " + self.topRatchet().dispatchCount);

                        // fire post-dispatch custom event
                        $('body').trigger('dispatch', [self.ratchet(), self.ratchet().isDispatchCompleted()]);

                        // fire afterDispatch event for ratchet
                        $('body').trigger('afterDispatch', [self.ratchet(), self.ratchet().isDispatchCompleted()]);

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
                    //   "morph" - the ratchet el's children are morphed into the rendered nodes, keeping any nodes
                    //             that haven't changed (see morphChildren below)
                    //
                    // the default is "insert" unless Ratchet.defaultGadgetStrategy says otherwise
                    //

                    var strategy = this.gadgetStrategy;
                    if (!strategy) {
                        strategy = Ratchet.defaultGadgetStrategy || "insert";
                    }

                    if (strategy === "morph")
                    {
                        morphChildren(self.ratchet(), self[0]);

                        postSwap(function() {
                            if (callback)
                            {
                                callback.call(self, $(self.ratchet().el));
                            }
                        });

                        return;
                    }

                    if (strategy === "replace")
                    {
                        // look through the rendered children to see if we can find a merge point
                        // a merge point means that there is just one top-most rendered child
                        // if we find one, then we'll merge attributes from ratchet el to merge point

                        var mergePoint = null;

                        // we must have some DOM children in order for there to be a merge point
                        if (self.children().length > 0)
                        {
                            // get rid of any white space nodes
                            var index = 0;
                            while (index < self[0].childNodes.length)
                            {
                                var current = self[0].childNodes[index];
                                if (current.nodeName == "#text")
                                {
                                    //if (current.textContent.trim() == 0)
                                    if (Ratchet.trim(current.textContent).length === 0)
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
                                if (self.children().length == 1)
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
                            attributes = $(mergePoint).prop("attributes");
                            $.each(attributes, function() {
                                var newValue = "";
                                if (this.name === "class")
                                {
                                    if (newEl.attr("class"))
                                    {
                                        newValue = newEl.attr("class") + " ";
                                    }
                                }

                                newValue += this.value;

                                $(newEl).attr(this.name, newValue);
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
                                    callback.call(self, $(self.ratchet().el));
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

                        // if no child nodes rendered, then nothing to swap
                        if ($(self)[0].childNodes.length === 0)
                        {
                            postSwap(function() {
                                if (callback)
                                {
                                    return callback.call(self, $(self.ratchet().el));
                                }
                            });

                            return;
                        }


                        // we'll use these to replace the current el
                        var replacements = $(self[0].childNodes);

                        // swap in replacements
                        var replacementsEl = $(replacements); // an array of elements
                        $(self.ratchet().el).replaceWith(replacementsEl);

                        // now update the ratchet "el" reference
                        self.ratchet().el = replacementsEl;

                        postSwap(function() {

                            // if swapping in multiple DOM elements, apply ratchet and gadget tags up to the parent
                            if ($(replacementsEl).children().length > 1) {
                                $(replacementsEl).parent().attr("gadget", originalAttributes["gadget"]);
                                $(replacementsEl).parent().attr("ratchet", originalAttributes["ratchet"]);
                            }

                            // if we really only have one dom element that serves as a replacement
                            // i.e. getting rid of all text (comments)
                            if ($(replacementsEl).filter("*").length == 1)
                            {
                                // then copy original dom attributes (from gadget tag) back to replacement node
                                var replacement = $(replacementsEl.filter("*")[0]);
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
                                callback.call(self, $(self.ratchet().el));
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
                            callback.call(self, $(self.ratchet().el));
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
        transform: function()
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
            if (templateIdentifier.indexOf("#") === 0) {
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

            }, function(el, err) {

                if (failureCallback)
                {
                    failureCallback(el, err);
                }

            });
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
        }


    });

})(jQuery);