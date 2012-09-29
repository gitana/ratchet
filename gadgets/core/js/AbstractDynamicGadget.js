(function($) {
    Ratchet.AbstractDynamicGadget = Ratchet.AbstractGadget.extend(
    {
        /**
         * Sequence is:
         *
         *   1) all of the javascript JS files are loaded and created, instantiated
         *   2) dispatch() is called on top-most
         *   3) looks for "gadget" on current dom element, gets type...
         *   4) finds any matching gadgets in registry and calls setup() on all of them
         */
        // this gets called during gadget creation (
        setup: function()
        {
            this.get(this.index);
        },

        index: function(el)
        {
            var self = this;

            //this.subscribe(this.subscription, this.refresh);

            //this.model(el);

            var handleRender = function(el, runtime)
            {
                // construct model
                var model = {};
                for (var key in runtime)
                {
                    model[key] = runtime[key];
                }

                self.doRender(el, model);
            };

            // are bindings already defined?
            var runtime = this.getRuntime();
            if (runtime)
            {
                handleRender(el, runtime);
            }
            else
            {
                this.loadRuntime(function(runtime) {

                    handleRender(el, runtime);

                }, function(http) {

                    self.prepareDefaultRuntime(function(runtime) {

                        if (!runtime)
                        {
                            runtime = {};
                        }

                        handleRender(el, runtime);
                    });

                });
            }
        },

        prepareDefaultRuntime: function(callback)
        {
            callback();
        },

        doRender: function(context, model)
        {
            var self = this;

            this.prepareModel(context, model, function() {
                self.render(context, model, function(el) {
                    self.beforeSwap(context, model, function() {
                        context.swap(function() {
                            self.afterSwap($(self.ratchet().el)[0], model, context, function() {

                                // nothing to do

                            });
                        });
                    });
                });
            });
        },

        render: function(el, model, callback)
        {
            var self = this;

            self.renderTemplate(el, self.TEMPLATE, model, function(el) {
                callback(el);
            });
        },

        prepareModel: function(el, model, callback)
        {
            if (callback)
            {
                callback();
            }
        },

        beforeSwap: function(el, model, callback)
        {
            if (callback)
            {
                callback();
            }
        },

        afterSwap: function(el, model, originalContext, callback)
        {

        },

        /*
        // finds the matching binding (if available as observable)
        getBinding: function()
        {
            var self = this;

            var found = null;

            var bindings = this.observable("bindings").get();
            for (var bindingId in bindings)
            {
                var binding = bindings[bindingId];
                if (binding.targetGadgetId == self.getGadgetId())
                {
                    found = binding;
                    break;
                }
            }

            return found;
        },
        */

        getRuntime: function()
        {
            var runtime = null;

            var observable = this.observable(this.subscription);
            if (observable)
            {
                runtime = observable.get();
            }

            return runtime;
        },

        loadRuntime: function(successCallback, failureCallback)
        {
            var self = this;

            // call over to node js
            $.ajax({
                url: self.RUNTIME_CONTROLLER + "/" + self.getGadgetType() + "/" + self.getGadgetId(), // + "?page=" + self.TYPE + "&pageKey=" + self.observable("page").get()["key"],
                "dataType": "json",
                success: function(config)
                {
                    successCallback(config)
                },
                error: function(http)
                {
                    failureCallback(http);
                }
            });
        }

    });

})(jQuery);
