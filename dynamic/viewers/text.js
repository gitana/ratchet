(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/viewers/text.css");

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

    return Ratchet.ViewerRegistry.register("text", Ratchet.AbstractViewer.extend({

        doConfigure: function()
        {
            this.config({
                "lang": "",
                "linenums": true
            });
        },

        canOperate: function()
        {
            return (typeof(prettyPrint) == "function") ? true: false;
        },

        canHandle: function(resource)
        {
            // we require a url to load the document
            if (!resource.url) {
                return false;
            }

            // make sure the mimetype is an text
            if (resource.mimetype) {
                if (resource.mimetype.indexOf("text/") == 0) {
                    return true;
                }
            }

            return false;
        },

        render: function(resource, container, callback)
        {
            var lang = this.config().lang;
            if (!lang)
            {
                // auto-determine from mimetype
                if (resource.mimetype == "text/html") {
                    lang = "html";
                }
            }

            var linenums = this.config().linenums;

            // load the text
            $.ajax({
                "url": resource.url,
                "dataType": "text",
                "success": function(text)
                {
                    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

                    var classes = 'prettyprint ' + (lang ? 'lang-' + lang : '');
                    if (linenums) {
                        classes += " linenums";
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
                        "message": "Unable to load resource: " + resource.url + " with message: " + http.message
                    });
                }
            });
        }

    }));
}));
