(function($)
{
    Ratchet.Controller = Ratchet.Abstract.extend(
    {
        constructor: function(dispatcher)
        {
            this.base();

            this.dispatcher = dispatcher;
        },

        registerMappings: function()
        {
        },

        getDispatcher: function()
        {
            return this.dispatcher;
        },

        register: function(uri, method, handler)
        {
            if (this.isString(handler))
            {
                // if it is a string, then it identifies a "view name" that we want to automatically handle

                // convert to a prebuilt function
                handler = this.createHandlerForView(handler);
            }

            this.getDispatcher().mapController(this, uri, method, handler);
        },

        renderView: function(modelAndView)
        {
            this.getDispatcher().renderView(modelAndView);
        },

        createHandlerForView: function(view)
        {
            var _this = this;

            // note: use a closure here to avoid loop problem
            // @see http://robertnyman.com/2008/10/09/explaining-javascript-scope-and-closures/
            var f = function(viewname)
            {
                return function(modelAndView)
                {
                    console.log("Handing view: " + viewname);

                    modelAndView.setView(viewname);
                    _this.renderView(modelAndView);
                };
            };

            console.log("Create handler for view: " + view);
            return f(view);
        }

    });

})(jQuery);