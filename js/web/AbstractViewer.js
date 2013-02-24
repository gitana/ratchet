(function() {

    Ratchet.AbstractViewer = Base.extend({

        constructor: function()
        {
            this.base();

            var self = this;

            var blockKeys = [];
            this.config = function(config)
            {
                if (config)
                {
                    // add config
                    var block = {
                        "evaluator": "viewer",
                        "condition": self.id,
                        "config": {
                            "viewers": {
                            }
                        }
                    };
                    block.config.viewers[self.id] = {};
                    Ratchet.merge(config, block.config.viewers[self.id]);
                    var blockKey = Ratchet.Configuration.add(block);

                    blockKeys.push(blockKey);
                }

                var c = {};
                var viewerConfig = Ratchet.Configuration.evaluate({
                    "viewer": self.id
                });
                if (viewerConfig.viewers && viewerConfig.viewers[self.id])
                {
                    Ratchet.merge(viewerConfig.viewers[self.id], c);
                }

                return c;
            };

        },

        // one-time setup call to allow the viewer to register its configuration
        configure: function(id)
        {
            this.id = id;

            this.doConfigure();
        },

        /**
         * @extension_point
         */
        doConfigure: function()
        {

        },

        /**
         * Lets this viewer determine whether they can render the resource.
         *
         * The resource attributes:
         *
         *    {
         *       "id": "",                                  (required - unique id for resource)
         *       "title": "",                               (required - display title)
         *       "kind": "file|webpage",                    (required - descriptor)
         *       "url": "http://www...",                    (required - url to resource source)
         *
         *       for files:
         *
         *       "size": 123112,                            (required - size in bytes)
         *       "mimetype": "image/png",                   (required - mimetype)
         *       "filename": "",                            (required - a file name)
         *
         *       file attachments (if available):
         *
         *       "attachments": {
         *         "attachmentId": {
         *           "url": "",                             (required - url to the attachment)
         *           "size": 123112,                        (required - size in bytes)
         *           "mimetype": "",                        (required - mimetype)
         *           "filename": ""                         (optional - a file name)
         *         }
         *       }
         *    }
         *
         * This method should solely make the decision as to whether it can handle the given TYPE of content.
         * Not whether it is functionally able to render it.
         *
         * @param context
         * @return {Boolean}
         */
        canHandle: function(resource)
        {
            return false;
        },

        /**
         * Validates whether this viewer can operate in the current device or browser.  This method should check
         * whether all required libraries or browser capabilities exist.  If not, then the method can indicate to the
         * framework that it is not able to proceed.
         *
         * @return {Boolean}
         */
        canOperate: function()
        {
            return false;
        },

        /**
         * This method gets called if the viewer has been picked and it is able to operationally render the resource
         * into the given container.
         *
         * @param resource
         * @param container dom element
         * @param callback callback function (pass err if fail)
         */
        render: function(resource, container, callback)
        {
            callback();
        }

    });

})();