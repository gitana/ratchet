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

            // custom callback
            if (callback)
            {
                callback.call(callback, self);
            }

            // process any regions
            self.ratchet().processRegions.call(self.ratchet(), self, function() {

                // process any gadgets

                // dispatcher post-render
                self.ratchet().processGadgets.call(self.ratchet(), self, function () {

                    // swap the contents of this element into the dispatcher's element
                    $(self.ratchet().el).html("");
                    var holder = $("<div></div>");
                    $(self.ratchet().el).append(holder);
                    $(holder).replaceWith(self[0].childNodes);

                    // copy attributes
                    Ratchet.copyAttributes(self, self.ratchet().el);
                    // fire post-swap custom event
                    $('body').trigger('swap', [self.ratchet()]);

                    // increment dispatch completion count
                    self.ratchet().incrementDispatchCompletionCount();

                    // fire post-dispatch custom event
                    $('body').trigger('dispatch', [self.ratchet(), self.ratchet().isDispatchCompleted()]);

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