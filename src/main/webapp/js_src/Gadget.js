(function($)
{
    Ratchet.Gadget = Base.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base();

            var _this = this;

            // privileged methods

            this.route = function(uri, method, viewHandler, controllerHandler)
            {
                // special case - "viewHandler" can be a String which identifies a template to execute!
                if (Ratchet.isString(viewHandler))
                {
                    var view = viewHandler;
                    viewHandler = function(context, model)
                    {
                        _this.renderTemplate.call(_this, context, model, view);
                    };
                }
                _this.getRatchet().route(this, uri, method, viewHandler, controllerHandler);
            };

            this.getRatchet = function()
            {
                return ratchet;
            };

            this.getContainer = function()
            {
                return container;
            };
        },

        getRatchet: function()
        {
            return this.ratchet;
        },

        createModel: function()
        {
            return this.getRatchet().createModel();
        },

        success: function(context, model)
        {
            if (context.successHandler)
            {
                context.successHandler();
            }
        },

        failure: function(context, model, message)
        {
            if (context.failureHandler)
            {
                context.failureHandler(message);
            }
        },

        /**
         * @extension_point
         *
         * This method gets called after the render so that the view can do any programmatic treatment of the dom.
         *
         * @param context
         * @param model
         */
        postRender: function(context, model)
        {
        },

        /**
         * TODO
         * Renders a given view using a template engine.
         *
         * @param context
         * @param model
         * @param [String] engine the template engine to use (if not provided, uses default)
         * @param {String} view the view to render (i.e. /a/b/c)
         */
        renderTemplate: function()
        {
            var _this = this;

            var args = Ratchet.makeArray(arguments);

            var engine;
            var view;

            var context = args.shift();
            var model = args.shift();

            var a1 = args.shift();
            var a2 = args.shift();
            if (a1)
            {
                if (a2)
                {
                    engine = a1;
                    view = a2;
                }
                else
                {
                    engine = "default";
                    view = a1;
                }
            }
            else
            {
                this.error("No view provided");
            }

            // TODO
            // support for multiple rendering engines and all that

            $.ajax({
                "url": "" + view + ".html",
                "dataType": "html",
                "success": function(html)
                {
                    Ratchet.debug("Rendering template: " + view + " with model: " + Ratchet.stringify(model));

                    var form = $(html).tmpl(model);
                    $(_this.getContainer()).html("");
                    $(_this.getContainer()).append(form);

                    // mark as having succeeded
                    _this.success(context, model);
                }
            });

        },

        getApplicationRatchet: function()
        {
            var ratchet = this.getRatchet();
            while (ratchet.getParent())
            {
                ratchet = ratchet.getParent();
            }

            return ratchet;
        },

        scope: function(scope)
        {
            return this.getRatchet().scope(scope);
        },

        /**
         * Dispatches a GET to a URI.
         *
         * @param uri
         */
        get: function(uri)
        {
            this.getApplicationRatchet().get(uri);
        },

        /**
         * Dispatches a POST to a URI.
         *
         * @param uri
         * @param data
         */
        post: function(uri, data)
        {
            this.getApplicationRatchet().dispatch({
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
            this.getApplicationRatchet().dispatch({
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
            this.getApplicationRatchet().dispatch({
                "method": "DELETE",
                "uri": uri
            });
        }
    });

})(jQuery);