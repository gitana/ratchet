(function($)
{
    Ratchet.jQueryTemplateEngine = Ratchet.BaseTemplateEngine.extend(
    {
        doRender: function(el, name, html, model, callback)
        {
            if (name)
            {
                if (!$.template[name]) {
                    $.template(name, html);
                }

                html = $.tmpl(name, model);
            }
            else
            {
                html = $.tmpl(html, model);
            }

            // fire callback
            if (callback) {
                callback(null, html);
            }
        }

    });

    // auto register
    Ratchet.TemplateEngineRegistry.register("tmpl", new Ratchet.jQueryTemplateEngine("tmpl"));

})(jQuery);