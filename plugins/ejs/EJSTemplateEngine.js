(function($)
{
    Ratchet.EJSTemplateEngine = Ratchet.BaseTemplateEngine.extend(
    {
        fileExtension: function() {
            return "ejs";
        },

        doRender: function(el, name, html, model, callback)
        {
            // build ejs
            var ejs = null;
            try
            {
                ejs = new EJS({
                    name: name,
                    text: html
                });
            }
            catch (e)
            {
                callback(e);
            }

            // render template
            html = ejs.render(model);

            // fire callback
            if (callback) {
                callback(null, html);
            }
        }

    });

    // auto register
    Ratchet.TemplateEngineRegistry.register("ejs", new Ratchet.EJSTemplateEngine("ejs"));

})(jQuery);