(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/viewers/pdf.css");

            var Ratchet = require("ratchet/web");
            var $ = require("jquery");

            var VIEWER_URL = module.uri + "/../pdfjs/web/viewer.html";

            return factory(Ratchet, $, VIEWER_URL);
        });
    }
    else
    {
        return factory(root.Ratchet, root.$, "./pdfjs/web/viewer.html");
    }

}(this, function(Ratchet, $, VIEWER_URL) {

    return Ratchet.ViewerRegistry.register("pdf", Ratchet.AbstractViewer.extend({

        doConfigure: function()
        {
            this.config({
            });
        },

        listSupportedMimetypes: function()
        {
            return [
                "application/pdf"
            ];
        },

        canOperate: function()
        {
            return true;
        },

        render: function(resource, container, callback)
        {
            var attachment = this.findAttachment(resource);

            // append the url
            var viewerUrl = VIEWER_URL + "?file=" + Ratchet.urlEncode(attachment.url);

            // id for the iframe id
            var id = "pdf-" + new Date().getTime();

            var html = "<iframe id='" + id + "' class='pdf-iframe' scrolling='no' width='100%' height='800px' src='" + viewerUrl + "'/>";

            $(container).addClass("pdf");
            $(container).append(html);

            callback();
        }

    }));
}));