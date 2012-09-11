(function($)
{
    Ratchet.EJSTemplateEngine = Ratchet.BaseTemplateEngine.extend(
    {
        doRender: function(el, templateId, model, successCallback, failureCallback)
        {
            var self = this;

            var templateURL = templateId;

            // load template
            var ejs = null;
            try
            {
                ejs = new EJS({url: templateURL});
            }
            catch (e)
            {
                if (failureCallback)
                {
                    failureCallback.call(failureCallback, el, e);
                }
            }

            var markup = ejs.render(model);
            markup = self.cleanMarkup(el, markup);

            $(el).html("");
            $(el).append(markup);

            if (successCallback)
            {
                successCallback.call(successCallback, el)
            }
        }

    });

    // auto register
    Ratchet.TemplateEngineRegistry.register("ejs", new Ratchet.EJSTemplateEngine("ejs"));

})(jQuery);