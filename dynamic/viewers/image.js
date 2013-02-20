(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/viewers/image.css");

            var Ratchet = require("ratchet/web");
            var $ = require("jquery");

            return factory(Ratchet, $);
        });
    }
    else
    {
        return factory(root.Ratchet, root.$);
    }

}(this, function(Ratchet, $) {

    return Ratchet.ViewerRegistry.register("image", Ratchet.AbstractViewer.extend({

        doConfigure: function()
        {
            this.config({
                "maxSize": 1000000
            });
        },

        canOperate: function()
        {
            // yes, all browsers support the image tag
            return true;
        },

        canHandle: function(resource)
        {
            // we can only render images if they have a URL
            if (!resource.url) {
                return false;
            }

            // make sure the mimetype is an image
            if (resource.mimetype) {
                if (resource.mimetype.indexOf("image/") == 0) {
                    return true;
                }
            }

            return false;
        },

        render: function(resource, container, callback)
        {
            // required resource properties
            var src = resource.url;
            var title = resource.title;

            // markup
            var html = null;

            // CHECK: max file size
            var maxSize = this.config().maxSize;
            if (maxSize > -1 && resource.size && resource.size > maxSize) {
                html = this.messageFrame("The image cannot render as it is too large");
            }
            else {
                html = "<img src='" + src + "' alt='" + title + "' title='" + title + "'/>";
            }

            $(container).addClass("image");
            $(container).append(html);

            callback();
        }

    }));
}));