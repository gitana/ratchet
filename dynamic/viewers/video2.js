(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/viewers/video2.css");

            var Ratchet = require("ratchet/web");
            var $ = require("jquery");

            require("css!ratchet/dynamic/viewers/videojs/video-js.css");
            require("ratchet/dynamic/viewers/videojs/video");

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
            html += "<source type='" + attachment.mimetype + "' src='" + attachment.url + "' title='" + title + "'></source>";
            html += "</video>";

            $(container).addClass("video");
            $(container).append(html);

            var myPlayer = _V_(id);

            callback();
        }

    }));
}));