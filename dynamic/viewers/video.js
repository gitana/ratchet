(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/viewers/video.css");

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

    return Ratchet.ViewerRegistry.register("video", Ratchet.AbstractViewer.extend({

        doConfigure: function()
        {
            this.config({
                "autoplay": true,
                "controls": true
            });
        },

        listSupportedMimetypes: function()
        {
            return [
                "video/*"
            ];
        },

        canOperate: function()
        {
            var valid = true;

            // <audio> tag not supported in IE < 9
            if (Ratchet.Browser.msie && Ratchet.Browser.version < 9)
            {
                valid = false;
            }

            // <audio> tag not supported in Firefox < 3.5
            if (Ratchet.Browser.firefox && Ratchet.Browser.version < 4)
            {
                valid = false;
            }

            // <audio> tag not supported in Safari < 3 (523)
            if (Ratchet.Browser.safari && Ratchet.Browser.version < 523)
            {
                valid = false;
            }

            return valid;
        },

        render: function(resource, container, callback)
        {
            var attachment = this.findAttachment(resource);

            // resource properties
            var title = resource.title ? resource.title: "";

            // audio configuration
            var autoplay = this.config().autoplay;
            var controls = this.config().controls;

            // markup
            var html = "";
            html += "<video width='100%' height='100%' controls alt='" + title + "' title='" + title + "'";
            if (autoplay) {
                html += " autoplay='autoplay'";
            }
            if (controls) {
                html += " controls='controls'";
            }
            html += ">";
            html += "   <source src='" + attachment.url + "'  type='" + attachment.mimetype + "'>";
            html += "</video>";

            $(container).addClass("video");
            $(container).append(html);

            callback();
        }

    }));
}));