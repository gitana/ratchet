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

        canHandle: function(resource)
        {
            // we can only render video files if they have a URL
            if (!resource.url) {
                return false;
            }

            // make sure the mimetype is a video file
            if (resource.mimetype) {
                if (resource.mimetype.indexOf("video/") == 0) {

                    // not flash
                    if (resource.mimetype == "application/x-shockwave-flash") {
                        // not supported
                        return false;
                    }
                    else if (resource.mimetype == "video/x-flv") {
                        // not supported
                        return false;
                    }

                    // ok
                    return true;
                }
            }

            return false;
        },

        render: function(resource, container, callback)
        {
            // resource properties
            var src = resource.url;
            var mimetype = resource.mimetype;
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
            html += "   <source src='" + src + "'  type='" + mimetype + "'>";
            html += "</video>";

            $(container).addClass("video");
            $(container).append(html);

            callback();
        }

    }));
}));