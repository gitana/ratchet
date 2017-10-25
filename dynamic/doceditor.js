(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");
            require("css!ratchet/dynamic/doceditor.css");

            var Ratchet = require("ratchet/web");
            var html = require("text!ratchet/dynamic/doceditor.html");

            require("ratchet/handlebars");
            require("bootstrap");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./doceditor.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.Gadgets.DocEditor = Ratchet.DynamicRegistry.register("doceditor", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,

        /**
         * @override
         */
        configure: function(gadgetIdentifier)
        {
            this.base(gadgetIdentifier);

            this.config({
                "defaults": {
                    "resource": {
                        "id": "",
                        "size": -1,
                        "mimetype": "",
                        "filename": ""
                    }
                }
            });

            this.configureDefault();
        },

        /**
         * @extension_point
         */
        configureDefault: function()
        {
        },

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                self.loadResource(el, model, function(resource)
                {
                    callback();

                });

            });
        },

        /**
         * @extension_point
         */
        loadResource: function(el, model, callback)
        {
            callback();
        },

        container: function(el)
        {
            return $(el).find(".doceditor");
        },

        afterSwap: function(el, model, context, callback)
        {
            var self = this;

            this.base(el, model, context, function() {

                // find the container
                var container = self.container(el);

                // load the resource
                var resource = {};
                Ratchet.merge(self.config().defaults.resource, resource);
                //var editorResource = self.observable(model.observables.editorResource).get();
                var editorResource = model.resource;
                if (editorResource)
                {
                    Ratchet.merge(editorResource, resource);

                    // build the condition
                    var condition = {};
                    Ratchet.merge(resource, condition);

                    // find all of the potential handlers
                    var handlers = Ratchet.EditorRegistry.lookupHandlers(condition);
                    if (handlers.length == 0)
                    {
                        console.log("No resource editor could be found for condition: " + JSON.stringify(condition));

                        $(container).append("An editor has not been configured for this type of attachment.<br/>Please contact your administrator and ask them to configure a compatible editor.");

                        model.noEditor = true;

                        return callback();
                    }

                    // walk handlers and try to execute each until one works
                    var exec = function(self, handlers, index, model)
                    {
                        if (index === handlers.length)
                        {
                            // ran off the end, didn't work
                            alert("Doceditor failed to render");

                            return callback();
                        }

                        var handler = handlers[index];
                        if (handler.canOperate())
                        {
                            handler.render.call(self, resource, container, model, function(err) {

                                if (!err) {

                                    self.handler = handler;

                                    // success
                                    return callback();
                                }
                                else {

                                    // cleanup
                                    $(container).empty();

                                    // try next one
                                    exec.call(this, self, handlers, index + 1, model);
                                }
                            });
                        }
                        else
                        {
                            // try next one
                            exec.call(this, self, handlers, index + 1, model);
                        }
                    };
                    exec.call(this, self, handlers, 0, model);
                }
                else
                {
                    // nothing to do
                    callback();
                }
            });
        },

        saveResource: function(resource, callback)
        {
            var self = this;

            self.handler.save(resource, function(err) {
                callback(err);
            });
        }

    }));

}));
