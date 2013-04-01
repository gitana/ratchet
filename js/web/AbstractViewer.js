/*jshint -W004 */ // duplicate variables
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

            /**
             * Determines whether the resource supports a preview URI for the given mimetype.
             *
             * @param resource
             * @param mimetype
             */
            var findUrlMatch = function(resource, mimetype)
            {
                var match = null;

                // regular expression matching
                var regex = Ratchet.wildcardToRegExp(mimetype);

                if (resource.attachments)
                {
                    for (var k in resource.attachments)
                    {
                        var arr = resource.attachments[k].mimetype.match(regex);
                        if (arr && arr.length > 0)
                        {
                            match = {
                                "url": resource.attachments[k].url,
                                "mimetype": resource.attachments[k].mimetype
                            };
                            break;
                        }
                    }
                }

                if (!match)
                {
                    var arr = resource.mimetype.match(regex);
                    if (arr && arr.length > 0)
                    {
                        match = {
                            "url": resource.url,
                            "mimetype": resource.mimetype
                        };
                    }
                }

                return match;
            };

            var urlMatches = function(resource, mimetypes)
            {
                var matches = [];

                for (var i = 0; i < mimetypes.length; i++)
                {
                    var match = findUrlMatch(resource, mimetypes[i]);
                    if (match)
                    {
                        matches.push({
                            mimetype: match.mimetype,
                            url: match.url
                        });
                    }
                }

                return matches;
            };

            this.findAttachments = function(resource)
            {
                var mimetypes = this.listSupportedMimetypes();

                return urlMatches(resource, mimetypes);
            };

            this.findAttachment = function(resource)
            {
                var attachment = null;

                var attachments = this.findAttachments(resource);
                if (attachments.length > 0)
                {
                    attachment = attachments[0];
                }

                return attachment;
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
         * Describes any supported attachment mimetypes that this viewer can render.
         *
         * @return {Array}
         */
        listSupportedMimetypes: function()
        {
            return [];
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
            return (this.findAttachments(resource).length > 0);
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