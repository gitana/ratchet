(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            var Ratchet = require("ratchet/web");
            var $ = require("jquery");

            // note: prettyPrint isn't AMD-friendly
            // these pollute the window.prettyPrint namespace
            // however, this seems to be par-for-the-course with prettyPrint
            require("ratchet/dynamic/viewers/prettify/prettify");
            require("css!ratchet/dynamic/viewers/prettify/prettify.css");
            //require("ratchet/dynamic/viewers/prettify/lang-css");

            require("css!ratchet/dynamic/viewers/text.css");

            return factory(Ratchet, $, window.prettyPrint);
        });
    }
    else
    {
        return factory(root.Ratchet, root.$, root.prettyPrint);
    }

}(this, function(Ratchet, $, prettyPrint) {

    return Ratchet.ViewerRegistry.register("text", Ratchet.AbstractViewer.extend({

        doConfigure: function()
        {
            this.config({
                "lang": "",
                "linenums": true
            });
        },

        listSupportedMimetypes: function()
        {
            return [
                "text/*"
            ];
        },

        canOperate: function()
        {
            return (typeof(prettyPrint) == "function") ? true: false;
        },

        render: function(resource, container, callback)
        {
            var attachment = this.findAttachment(resource);

            var lang = this.config().lang;
            if (!lang)
            {
                // auto-determine from mimetype
                if (attachment.mimetype == "text/html") {
                    lang = "html";
                }
            }

            var linenums = this.config().linenums;

            // load the text
            $.ajax({
                "url": attachment.url,
                "dataType": "text",
                "success": function(text)
                {
                    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

                    var classes = 'prettyprint ' + (lang ? 'lang-' + lang : '');
                    if (linenums) {
                        classes += " linenums:4";
                    }

                    var html = "<pre class='" + classes + "'>" + text + "</pre>";
                    $(container).addClass("text");
                    $(container).append(html);

                    // now run pretty print
                    prettyPrint();

                    // success
                    callback();
                },
                "failure": function(http)
                {
                    // fire back error
                    callback({
                        "message": "Unable to load resource: " + attachment.url + " with message: " + http.message
                    });
                }
            });
        }

    }));
}));
