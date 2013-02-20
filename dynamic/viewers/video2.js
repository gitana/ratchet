(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/viewers/video2.css");

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

            /*
            // <video> tag not supported in IE < 9
            if (Ratchet.Browser.msie && Ratchet.Browser.version < 9)
            {
                valid = false;
            }

            // <video> tag not supported in Firefox < 3.5
            if (Ratchet.Browser.firefox && Ratchet.Browser.version < 4)
            {
                valid = false;
            }

            // <video> tag not supported in Safari < 3 (523)
            if (Ratchet.Browser.safari && Ratchet.Browser.version < 523)
            {
                valid = false;
            }
            */

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

            var id = "video2-" + new Date().getTime();

            // audio configuration
            var autoplay = this.config().autoplay;
            var controls = this.config().controls;

            // markup
            //var width = "100%";
            //var height = "100%";
            var width = 640;
            var height = 320;
            var poster = null;
            var html = "";
            html += "<video";
            html += " id='" + id + "'";
            html += " class='video-js vjs-default-skin'";
            if (controls) {
                html += " controls";
            }
            if (width) {
                html += " width='" + width + "'";
            }
            if (height) {
                html += " height='" + height + "'";
            }
            if (poster) {
                html += " poster='" + poster + "'";
            }
            if (autoplay) {
                html += " autoplay";
            }
            html += " preload='auto'";
            html += ">";
            html += "<source type='" + mimetype + "' src='" + src + "' title='" + title + "'>";
            html += "</video>";

            $(container).addClass("video");
            $(container).append(html);

            var myPlayer = _V_(id);

            callback();
        }

    }));
}));