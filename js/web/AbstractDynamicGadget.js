(function($) {
    Ratchet.AbstractDynamicGadget = Ratchet.Gadget.extend(
    {
        RUNTIME_CONTROLLER: "_gadget",
        HTML: "",

        constructor: function(type, ratchet, id) {
            this.base(type, ratchet, id);

            this.subscription = "gadget_" + type + "_" + id;
        },

        setup: function()
        {
            this.get(this.index);
        },

        _observable : function (key, args, defaultVal) {
            var _args = Ratchet.makeArray(args);
            if (_args.length > 0) {
                if (typeof _args[0] == "string") {
                    key = _args.shift();
                    if (_args.length > 0) {
                        this.observable(key).set(_args.shift());
                    }
                }
                else {
                    this.observable(key).set(_args.shift());
                }
            }
            var val = this.observable(key).get();
            if (val == null && defaultVal != null) {
                val = defaultVal;
                this.observable(key).set(defaultVal);
            }
            return val;
        },

        _clearObservable: function(key, defaultKey) {
            var _key = key ? key : defaultKey;
            this.observable(_key).clear();
        },

        renderTemplate: function(el, templateIdentifier, data, callback) {

            if (data && callback) {
                el.transform(templateIdentifier, data, function(el) {
                    callback(el);
                });
            } else {
                callback = data;
                el.transform(templateIdentifier, function(el) {
                    callback(el);
                });
            }
        },

        index: function(el)
        {
            var self = this;

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
                url: self.RUNTIME_CONTROLLER + "?key=" + self.getGadgetId(),
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
