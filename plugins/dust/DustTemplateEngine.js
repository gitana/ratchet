(function($)
{
    Ratchet.DustTemplateEngine = Ratchet.BaseTemplateEngine.extend(
    {
        fileExtension: function() {
            return "dust";
        },

        doRender: function(el, name, html, model, callback)
        {
            var compiled = dust.compile(html, name);

            dust.loadSource(compiled);

            dust.render(name, model, function(err, out) {

                if (callback) {
                    callback(err, html);
                }
            });
        }

    });

    // auto register
    Ratchet.TemplateEngineRegistry.register("dust", new Ratchet.DustTemplateEngine("dust"));

})(jQuery);