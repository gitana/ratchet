(function($)
{
    Ratchet.HandlebarsTemplateEngine = Ratchet.BaseTemplateEngine.extend(
    {
        fileExtension: function() {
            return "html";
        },

        doRender: function(el, name, html, model, callback)
        {
            var template = null;

            // compile
            try
            {
                template = Handlebars.compile(html);
            }
            catch (e)
            {
                callback(e);
            }

            // render template
            html = template(model);

            // fire callback
            if (callback) {
                callback(null, html);
            }
        }

    });

    // auto register
    Ratchet.TemplateEngineRegistry.register("handlebars", new Ratchet.HandlebarsTemplateEngine("handlebars"));

})(jQuery);