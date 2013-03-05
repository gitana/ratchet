(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/viewers/flash.css");

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

    return Ratchet.ViewerRegistry.register("flash", Ratchet.AbstractViewer.extend({

        doConfigure: function()
        {
        },

        listSupportedMimetypes: function()
        {
            return [
                "application/x-shockwave-flash"
            ];
        },

        canOperate: function()
        {
            // TODO: detect the right version of flash player available in browser?
            return true;
        },

        render: function(resource, container, callback)
        {
            var attachment = this.findAttachment(resource);

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
                "movie": attachment.url,
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
            html += " src='" + attachment.url + "'";
            html += " quality='" + params.quality + "'";
            html += " bgcolor='" + params.bgcolor + "'";
            html += " width='" + widthStr + "'";
            html += " height='" + heightStr + "'";
            html += " name='" + resource.id + "'";
            html += " align=''";
            html += " type='" + attachment.mimetype + "'";
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
