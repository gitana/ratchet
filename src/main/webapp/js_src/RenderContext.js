(function($)
{
    Ratchet.RenderContext = Base.extend(
    {
        constructor: function(ratchet, routeContext, domEl)
        {
            this.base();

            var container = $("<div></div>");
            if (domEl)
            {
                container.html($(domEl).html());
            }

            // copy container properties into this
            jQuery.extend(this, container, { "route" : routeContext });

            /*
            this.callbacks = [];
            this.previous_content = null;
            this.content = null;
            this.waiting = false;
            */

            // privileged methods

            this.ratchet = function()
            {
                return ratchet;
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
        },

        swap: function(callback)
        {
            // custom callback
            if (callback)
            {
                callback.call(callback, this);
            }

            // process any gadgets

            // dispatcher post-render
            this.ratchet().processGadgets.call(this.ratchet(), this);

            // swap the contents of this element into the dispatcher's element
            $(this.ratchet().el).html("");
            var holder = $("<div></div>");
            $(this.ratchet().el).append(holder);
            $(holder).replaceWith(this[0].childNodes);

            // copy attributes
            Ratchet.copyAttributes(this, this.ratchet().el);
            // fire post-swap custom event
            $('body').trigger('swap', [this.ratchet()]);
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

            // NOTE: this requires the jQuery template engine plugin
            /*
            if (Ratchet.isUndefined(Ratchet.jQueryTemplateEngine))
            {
                Ratchet.error("Cannot render template, the jQueryTemplateEngine plugin must be included");
                return;
            }

            var engine = Ratchet.jQueryTemplateEngine.instance;
            if (!engine)
            {
                engine = new Ratchet.jQueryTemplateEngine("default");
                Ratchet.jQueryTemplateEngine.instance = engine;
            }
            */
            var engine = Ratchet.renditionEngine;
            if (!engine)
            {
                if (Ratchet.isUndefined(Ratchet.jQueryTemplateEngine))
                {
                    Ratchet.error("No rendition engine is provided and cannot create a default jQueryTemplateEngine since the plugin is not included.");
                    return;
                }
                else
                {
                    engine = new Ratchet.jQueryTemplateEngine("default");
                    Ratchet.renditionEngine = engine;
                }
            }

            // do the render
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





        /*

        _then: function(callback)
        {
            var context = this;

            if (this.waiting)
            {
                this.callbacks.push(callback);
            }
            else
            {
                this._wait();

                window.setTimeout(function()
                {
                    var returned = callback.apply(context, [context.content, context.previous_content]);
                    if (returned !== false)
                    {
                        context._next(returned);
                    }
                }, 0);
            }

            return this;
        },

        _wait: function()
        {
            this.waiting = true;
            this.waiting = true;
        },

        _next: function(content)
        {
            this.waiting = false;
            if (typeof content !== "undefined") {
                this.previous_content = this.content;
                this.content = content;
            }

            if (this.callbacks.length > 0) {
                this._then(this.callbacks.shift());
            }
        },

        fetch: function(url, options)
        {
            var context = this;

            if (!options)
            {
                options = {};
            }

            return this._then(function() {

                this._wait();

                var isJson = (url.match(/\.json$/) || options.json);

                $.ajax($.extend({
                    "url": url,
                    "data": {},
                    "dataType": (isJson ? "json" : null),
                    "type": "get",
                    "success": function(data)
                    {
                        context._next(data);
                    }
                }, options));

                return false;
            });
        },

        transform: function(templateId, model)
        {
            var context = this;

            if (!model)
            {
                model = {};
            }

            var templateURL = templateId + ".html";

            return this._then(function() {

                this._wait();

                if (context.content)
                {
                    Ratchet.copyInto(model, context.content);
                }

                var renderTemplate = function(templateId, model)
                {
                    var markup = $.tmpl(templateId, model);

                    context.html("");
                    context.append(markup);

                    context._next();
                };

                if ($.template[templateId])
                {
                    renderTemplate(templateId, model);
                }
                else
                {
                    $.ajax({
                        "url": "" + templateURL,
                        "dataType": "html",
                        "success": function(html)
                        {
                            // convert to a dom briefly
                            // this is because it starts with <script> and we only want what is inside
                            var dom = $(html);
                            html = dom.html();

                            // compile template
                            $.template(templateId, html);

                            // render template
                            renderTemplate(templateId, model);
                        }
                    });

                    return false;
                }
            });

        }
        */

    });

})(jQuery);