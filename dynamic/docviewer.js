(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            require("ratchet/dynamic/common.css");
            require("ratchet/dynamic/docviewer.css");

            var Ratchet = require("ratchet/web");
            var html = require("ratchet/dynamic/docviewer.html");

            require("ratchet/handlebars");
            require("bootstrap");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./docviewer.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.Gadgets.DocViewer = Ratchet.DynamicRegistry.register("docviewer", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                callback();

            });
        },

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
                        "title": "",
                        "kind": "",
                        "url": "",

                        "size": -1,
                        "mimetype": "",
                        "filename": "",

                        "attachments": {
                        }
                    }
                },
                "observables": {
                    "viewerResource": "viewerResource" // the observable id to watch defining the resource
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

        /**
         * @extension_point
         */
        loadResource: function(el, model, callback)
        {
            callback();
        },

        beforeSwap: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                self.loadResource(el, model, function(resource)
                {
                    if (resource) {
                        self.observable(model.observables.viewerResource).set(resource);
                    }

                    // set up observables
                    var refreshHandler = self.refreshHandler(el);

                    // when the "viewerResource" observable changes, update the doc viewer
                    self.subscribe(model.observables.viewerResource, refreshHandler);

                    callback();

                });

            });
        },

        afterSwap: function(el, model, context, callback)
        {
            var self = this;

            this.base(el, model, context, function() {

                // find the container
                var container = $(el).find(".docviewer");
                if (container.length == 0)
                {
                    container = $(el);
                }

                // load the resource
                var resource = {};
                Ratchet.merge(self.config().defaults.resource, resource);
                var viewerResource = self.observable(model.observables.viewerResource).get();
                if (viewerResource)
                {
                    Ratchet.merge(viewerResource, resource);

                    // build the condition
                    var condition = {};
                    Ratchet.merge(resource, condition);

                    // find all of the potential handlers
                    var handlers = Ratchet.ViewerRegistry.lookupHandlers(condition);
                    if (handlers.length == 0)
                    {
                        console.log("No resource viewer could be found for condition: " + JSON.stringify(condition));

                        $(container).append("This document does not have any attachments.");

                        callback();
                        return;
                    }

                    // walk handlers and try to execute each until one works
                    var exec = function(handlers, index)
                    {
                        if (index == handlers.length)
                        {
                            // ran off the end, didn't work
                            alert("Docviewer failed to render");

                            callback();

                            return;
                        }

                        var handler = handlers[index];

                        if (handler.canOperate())
                        {
                            resource.observableHolder = self;

                            handler.render(resource, container, function(err) {

                                if (!err)
                                {
                                    handler.afterRender(resource, container, function() {

                                        self.afterRender(handler, resource, container, function() {

                                            // success
                                            return callback();
                                        });

                                    });
                                }
                                else
                                {

                                    // cleanup
                                    $(container).empty();

                                    // try next one
                                    exec(handlers, index+1);
                                }
                            });
                        }
                        else
                        {
                            // try next one
                            exec(handlers, index+1);
                        }
                    };
                    exec(handlers, 0);
                }
                else
                {
                    // nothing to do
                    callback();
                }
            });
        },

        afterRender: function(handler, resource, container, callback)
        {
            callback();
        }


    }));

}));
