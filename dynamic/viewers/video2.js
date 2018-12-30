(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) !== "undefined"))
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/viewers/video2.css");

            var Ratchet = require("ratchet/web");
            var $ = require("jquery");

            // https://github.com/videojs/video.js
            require("css!videojs/video-js.css");
            var VideoJS = require("videojs/video");

            return factory(Ratchet, $, VideoJS);
        });
    }
    else
    {
        return factory(root.Ratchet, root.$, root.videojs);
    }

}(this, function(Ratchet, $) {

    return Ratchet.ViewerRegistry.register("video", Ratchet.AbstractViewer.extend({

        doConfigure: function()
        {
            this.config({
                "autoplay": false,
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
            return true;
        },

        render: function(resource, container, callback)
        {
            var attachment = this.findAttachment(resource);

            // resource properties
            var title = resource.title ? resource.title: "";

            // dom
            var id = "video2-" + new Date().getTime();

            // audio configuration
            var autoplay = this.config().autoplay;
            var controls = this.config().controls;

            // markup
            var width = "100%";
            var height = "auto";
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
            html += " style='width:100%;height:100%;'";
            html += ">";
            html += "<source type='" + attachment.mimetype + "' src='" + attachment.url + "' title='" + title + "'></source>";
            html += "</video>";

            $(container).addClass("video");
            $(container).append(html);

            callback();
        }

    }));
}));