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


                    // determine the appropriate merge point
                    // this is either all of the child nodes that we rendered out or if we rendered a single
                    // node with lots of children under it, then we'll use that single node
                    var mergePoint = null;
                    if (self.children().size() == 0)
                    {
                        // there are no dom node children
                        // we assume that there is valid text somewhere in there
                        // use ourselves as a mergepoint so that children get collected in
                        mergePoint = self; //
                    }
                    else
                    {
                        // there is at least one dom element in here...

                        // if multiple, then use self as merge point
                        if (self.children().size() > 1)
                        {
                            mergePoint = self;
                        }
                        else
                        {
                            // otherwise, there is either
                            //   a) stray whitespace text + a dom element
                            //   b) text we want to keep + dom element

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
                            if (self[0].childNodes[0].nodeName.toLowerCase() == self.children()[0].nodeName)
                            {
                                // just one child node (which is a dom node), so use it as a merge point
                                mergePoint = self.children()[0];
                            }
                            else
                            {
                                // what remains is text + dom mixture, so add all children
                                mergePoint = self;
                            }

                        }
                    }

                    // if the merge point dom type is different from self.ratchet().el...
                    // then we have to recreate the el
                    if ($(mergePoint)[0].nodeName != $(self.ratchet().el)[0].nodeName)
                    {
                        // assume mergepoint is correct
                        // but if original is BODY, then we preserve
                        var name = $(mergePoint)[0].nodeName;
                        if ($(self.ratchet().el)[0].nodeName.toLowerCase() == "body")
                        {
                            name = "body";
                        }

                        var newEl = $("<" + name + "></" + name + ">");

                        // copy original attributes to target (such as class and id)
                        var attributes = $(self.ratchet().el).prop("attributes");
                        $.each(attributes, function() {
                            $(newEl).attr(this.name, this.value);
                        });
                        // set a temp key so we can look up after replace
                        var tk = "key-" + new Date().getTime();
                        $(newEl).attr("tk", tk);

                        // replace in DOM
                        $(self.ratchet().el).replaceWith(newEl);

                        // now find what we replaced and clean up
                        newEl = $("[tk=" + tk + "]");
                        $(newEl).removeAttr("tk");

                        // now update the ratchet "el" reference
                        self.ratchet().el = $(newEl)[0];
                    }

                    // clear the live element
                    // append the children from the in-memory swap copy
                    $(self.ratchet().el).html("");
                    $(self.ratchet().el).append($(mergePoint)[0].childNodes);

                    // copy attributes
                    Ratchet.copyAttributes($(mergePoint), self.ratchet().el);

                    // fire post-swap custom event
                    $('body').trigger('swap', [self.ratchet()]);

                    // increment dispatch completion count
                    self.ratchet().incrementDispatchCompletionCount();

                    // fire post-dispatch custom event
                    $('body').trigger('dispatch', [self.ratchet(), self.ratchet().isDispatchCompleted()]);

                    // custom callback
                    if (callback)
                    {
                        callback.call(self);
                    }

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
         * Transforms using a template and data (model).
         *
         * @param {String} templateId template id
         * @param [Object] model data model
         * @param {Function} successCallback
         * @param [Function] failureCallback
         */
        transform: function(templateId, data, successCallback, failureCallback)
        {
            var _this = this;

            var args = Ratchet.makeArray(arguments);

            var templateId = args.shift();
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

            // render
            engine.render(_this, templateId, model, function(el) {

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