(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/viewers/pdf.css");

            var Ratchet = require("ratchet/web");
            var $ = require("jquery");

            var VIEWER_URL = module.uri + "/../pdfjs/viewer.html";

            return factory(Ratchet, $, VIEWER_URL);
        });
    }
    else
    {
        return factory(root.Ratchet, root.$, "./pdfjs/viewer.html");
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

            var html = "<iframe id='" + id + "' class='pdf-iframe' scrolling='no' width='100%' height='600px' src='" + viewerUrl + "'/>";

            $(container).addClass("pdf");
            $(container).append(html);

            callback();
        }

    }));
}));