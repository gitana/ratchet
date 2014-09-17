(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            var Ratchet = require("ratchet/web");
            var $ = require("jquery");
            var ace = require("ace/ace");
            var ace = window.ace;

            require("css!ratchet/dynamic/editors/ace/ace.css");

            return factory(Ratchet, $, ace);
        });
    }
    else
    {
        return factory(root.Ratchet, root.$, root.ace);
    }

}(this, function(Ratchet, $, ace) {

    return Ratchet.AbstractEditor.extend({

        doConfigure: function()
        {
            this.config({
                "theme": "ace/theme/textmate",
                "mode": "ace/mode/text",
                "fit": false,
                "readonly": false,
                "mimetypes": ["text/*"]
            });
        },

        listSupportedMimetypes: function()
        {
            return this.config().mimetypes;
        },

        cleanup: function(text)
        {
            return text;
        },

        render: function(resource, container, callback)
        {
            var self = this;

            var theme = this.config().theme;
            var mode = this.config().mode;
            var fit = this.config().fit;
            var readonly = this.config().readonly;

            self.load(resource, function(err, text) {

                if (err)
                {
                    // resource does exist but it failed to load
                    callback(err);
                    return;
                }

                if (!text)
                {
                    text = "";
                }

                text = self.cleanup(text);

                var el = $("<div class='text-editor'></div>");
                container.empty();
                container.append(el);

                if (window.ace)
                {
                    ace = window.ace;
                }

                self.editor = ace.edit($(container).find(".text-editor")[0]);

                // theme
                self.editor.setTheme(theme);

                // mode
                self.editor.getSession().setMode(mode);

                self.editor.renderer.setHScrollBarAlwaysVisible(false);
                //self.editor.renderer.setVScrollBarAlwaysVisible(false); // not implemented
                self.editor.setShowPrintMargin(false);

                // set data onto editor
                self.editor.setValue(text);
                self.editor.clearSelection();

                // clear undo session
                self.editor.getSession().getUndoManager().reset();

                // FIT-CONTENT the height of the editor to the contents contained within
                if (fit)
                {
                    var heightUpdateFunction = function() {

                        // http://stackoverflow.com/questions/11584061/
                        var newHeight = self.editor.getSession().getScreenLength() * self.editor.renderer.lineHeight + self.editor.renderer.scrollBar.getWidth();

                        $(self.fieldContainer).height(newHeight.toString() + "px");

                        // This call is required for the editor to fix all of
                        // its inner structure for adapting to a change in size
                        self.editor.resize();
                    };

                    // Set initial size to match initial content
                    heightUpdateFunction();

                    // Whenever a change happens inside the ACE editor, update
                    // the size again
                    self.editor.getSession().on('change', heightUpdateFunction);
                }

                // READONLY
                if (readonly)
                {
                    self.editor.setReadOnly(true);
                }

                // if the editor's dom element gets destroyed, make sure we clean up the editor instance
                // normally, we expect Alpaca fields to be destroyed by the destroy() method but they may also be
                // cleaned-up via the DOM, thus we check here.
                $(el).bind('destroyed', function() {

                    if (self.editor) {
                        self.editor.destroy();
                        self.editor = null;
                    }
                });

                // success
                callback();
            });
        },

        load: function(resource, callback)
        {
            // if resource is known not yet to exist, hand back empty
            if (!resource.exists)
            {
                callback(null, "");
            }

            $.ajax({
                "url": resource.url,
                "dataType": "text",
                "success": function(text)
                {
                    // auto-trim
                    if (text)
                    {
                        text = Ratchet.trim(text);

                        // remove null characters since ace freaks on some of these
                        text = Ratchet.replaceAll(text, '\\u0000', '');
                    }

                    callback(null, text);
                },
                "error": function(xhr, textStatus, errorThrown)
                {
                    // fire back error
                    callback({
                        "message": "Unable to load resource: " + resource.url + " with message: " + textStatus,
                        "xhr": xhr,
                        "errorThrown": errorThrown
                    });
                }
            });
        },

        save: function(resource, callback)
        {
            var self = this;

            var value = self.editor.getValue();

            $.ajax({
                "url": resource.url,
                "dataType": "text",
                "contentType": resource.mimetype,
                "type": "POST",
                "data": value,
                "success": function(text)
                {
                    callback(null, text);
                },
                "error": function(xhr, textStatus, errorThrown)
                {
                    // fire back error
                    callback({
                        "message": "Unable to save resource: " + resource.url + " with message: " + textStatus,
                        "xhr": xhr,
                        "errorThrown": errorThrown
                    });
                }
            });

        }

    });
}));
