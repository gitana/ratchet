define(["ratchet/ratchet", "base"], function(Ratchet, Base) {

    return Ratchet.AbstractEditor = Base.extend({

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
                        "evaluator": "editor",
                        "condition": self.id,
                        "config": {
                            "editors": {
                            }
                        }
                    };
                    block.config.editors[self.id] = {};
                    Ratchet.merge(config, block.config.editors[self.id]);
                    var blockKey = Ratchet.Configuration.add(block);

                    blockKeys.push(blockKey);
                }

                var c = {};
                var editorConfig = Ratchet.Configuration.evaluate({
                    "editor": self.id
                });
                if (editorConfig.editors && editorConfig.editors[self.id])
                {
                    Ratchet.merge(editorConfig.editors[self.id], c);
                }

                return c;
            };
        },

        // one-time setup call to allow the editor to register its configuration
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
         * Describes any supported attachment mimetypes that this editor can handle.
         *
         * @return {Array}
         */
        listSupportedMimetypes: function()
        {
            return [];
        },

        /**
         * Validates whether this editor can operate in the current device or browser.  This method should check
         * whether all required libraries or browser capabilities exist.  If not, then the method can indicate to the
         * framework that it is not able to proceed.
         *
         * @return {Boolean}
         */
        canOperate: function()
        {
            return true;
        },

        /**
         * Lets this editor determine whether they can render a binary with the given descriptor.
         *
         * The resource attributes:
         *
         *    {
         *       "id": "identifier",
         *       "size": "size",
         *       "mimetype": "mimetype",
         *       "filename": "filename",
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
            var canHandle = false;

            // mimetype check
            if (resource && resource.mimetype)
            {
                var mimetypes = this.config().mimetypes;
                if (mimetypes)
                {
                    for (var i = 0; i < mimetypes.length; i++)
                    {
                        // regular expression matching
                        var regex = Ratchet.wildcardToRegExp(mimetypes[i]);
                        if (resource.mimetype.match(regex))
                        {
                            canHandle = true;
                            break;
                        }
                    }
                }
            }

            return canHandle;
        },

        /**
         * This method gets called if the editor has been picked and it is able to operationally render the resource
         * into the given container.
         *
         * @param resource
         * @param container dom element
         * @param callback callback function (pass err if fail)
         */
        render: function(resource, container, callback)
        {
            callback();
        },

        /**
         * @extension_point
         *
         * Loads data from resource.
         *
         * @param resource
         * @param callback
         */
        load: function(resource, callback)
        {
            callback();
        },

        /**
         * @extension_point
         *
         * Saves data back
         *
         * @param resource
         * @param callback
         */
        save: function(resource, callback)
        {
            callback();
        }

    });

});