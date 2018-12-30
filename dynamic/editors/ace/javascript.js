(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) !== "undefined"))
    {
        // AMD
        define(function(require, exports, module) {

            var Ratchet = require("ratchet/web");
            var $ = require("jquery");
            var ace = require("ace/ace");

            var AceEditor = require("ratchet/dynamic/editors/ace/ace");

            return factory(Ratchet, $, ace, AceEditor);
        });
    }
    else
    {
        return factory(root.Ratchet, root.$, root.ace, root.AceEditor);
    }

}(this, function(Ratchet, $, ace, AceEditor) {

    return Ratchet.EditorRegistry.register("javascript", AceEditor.extend({

        doConfigure: function()
        {
            this.config({
                "mode": "ace/mode/javascript",
                "mimetypes": ["application/javascript", "application/js", "script/javascript", "script/js", "text/javascript", "text/js"]
            });
        }

    }));
}));
