(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/viewers/flash.css");

            var Ratchet = require("ratchet/web");
            var $ = require("jquery");
            var swfobject = require("swfobject");

            return factory(Ratchet, $, swfobject);
        });
    }
    else
    {
        return factory(root.Ratchet, root.$, root.swfobject);
    }

}(this, function(Ratchet, $, swfobject) {

    return Ratchet.ViewerRegistry.register("flash", Ratchet.AbstractViewer.extend({

        canOperate: function()
        {
            // TODO: detect the right version of flash player available in browser?
            return true;
        },

        canHandle: function(resource)
        {
            // we can only render flash files if they have a URL
            if (!resource.url) {
                return false;
            }

            if (resource.mimetype == "application/x-shockwave-flash") {
                // supported
            }
            else {
                // not supported mimetype
                return false;
            }

            return true;
        },

        render: function(resource, container, callback)
        {
            // OBJECT dom element properties
            var id = "flash_object_" + new Date().getTime();
            var widthStr = "100%";
            var heightStr = "100%";

            // start building the html
            var html = "";
            html += "<object";
            html += " id='" + id + "'";
            html += " classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000'";
            html += " codebase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0'";
            html += " width='" + widthStr + "'";
            html += " height='" + heightStr + "'";
            html += ">";

            // params
            var params = {
                "movie": resource.url,
                "quality": "high",
                "bgcolor": "#ffffff",
                "allowScriptAccess": "never",
                "allowFullScreen": "true",
                "wmode": "transparent"
            };
            for (var k in params) {
                var v = params[k];
                html += "<param name='" + k + "' value='" + v + "'/>";
            }

            // embed
            html += "<embed";
            html += " src='" + resource.url + "'";
            html += " quality='" + params.quality + "'";
            html += " bgcolor='" + params.bgcolor + "'";
            html += " width='" + widthStr + "'";
            html += " height='" + heightStr + "'";
            html += " name='" + resource.id + "'";
            html += " align=''";
            html += " type='" + resource.mimetype + "'";
            html += " pluginspage='http://www.macromedia.com/go/getflashplayer'";
            html += ">";
            html += "</embed>";

            // end object
            html += "</object>";

            $(container).addClass("flash");
            $(container).append(html);

            callback();
        }

    }));
}));
