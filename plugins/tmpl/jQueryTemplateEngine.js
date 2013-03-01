(function($)
{
    Ratchet.jQueryTemplateEngine = Ratchet.BaseTemplateEngine.extend(
    {
        doRender: function(el, name, html, model, callback)
        {
            var ex = null;

            if (name)
            {
                if (!$.template[name]) {
                    $.template(name, html);
                }

                try
                {
                    html = $.tmpl(name, model);
                }
                catch (e)
                {
                    ex = e;
                }
            }
            else
            {
                try
                {
                    html = $.tmpl(html, model);
                }
                catch (e)
                {
                    ex = e;
                }
            }

            var err = null;
            if (ex) {
                err = {};
                err.lineNumber = ex.lineNumber;
                err.columnNumber = ex.columnNumber;
                err.stack = ex.stack;
                err.templateEngine = "tmpl";
                err.templateName = name;
                err.templateHtml = html;
                err.message = ex.message + " (line: " + err.lineNumber + ", column: " + err.columnNumber + ")";
            }

            if (err) {
                Ratchet.logDebug(err.message);
            }

            // fire callback
            if (callback) {
                callback(err, html);
            } else {
                throw new Error(err);
            }
        }

    });

    // auto register
    Ratchet.TemplateEngineRegistry.register("tmpl", new Ratchet.jQueryTemplateEngine("tmpl"));

})(jQuery);