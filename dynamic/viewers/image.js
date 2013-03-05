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

        listSupportedMimetypes: function()
        {
            return [
                "image/*"
            ];
        },

        canOperate: function()
        {
            // yes, all browsers support the image tag
            return true;
        },

        render: function(resource, container, callback)
        {
            var attachment = this.findAttachment(resource);

            // required resource properties
            var title = resource.title;

            // markup
            var html = null;

            // CHECK: max file size
            var maxSize = this.config().maxSize;
            if (maxSize > -1 && resource.size && resource.size > maxSize) {
                html = this.messageFrame("The image cannot render as it is too large");
            }
            else {
                html = "<img src='" + attachment.url + "' alt='" + title + "' title='" + title + "'/>";
            }

            $(container).addClass("image");
            $(container).append(html);

            callback();
        }

    }));
}));