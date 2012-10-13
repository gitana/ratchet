(function($)
{
    Ratchet.jQueryTemplateEngine = Ratchet.BaseTemplateEngine.extend(
    {
        doRender: function(el, templateId, model, successCallback, failureCallback)
        {
            var self = this;

            var renderTemplate = function()
            {
                var markup = $.tmpl(templateId, model);

                $(el).html("");
                $(el).append(markup);

                //el.html(markup.html())

                if (successCallback)
                {
                    successCallback.call(successCallback, el)
                }
            };

            if ($.template[templateId])
            {
                // already loaded - so just render

                renderTemplate();
            }
            else
            {
                // need to load the template first and then render

                var templateURL = templateId + ".html";

                $.ajax({
                    "url": "" + templateURL,
                    "dataType": "html",
                    "success": function(html)
                    {
                        html = self.cleanMarkup(el, html);

                        // compile template
                        $.template(templateId, html);

                        // render template
                        renderTemplate();
                    },
                    "failure": function(http)
                    {
                        if (failureCallback)
                        {
                            failureCallback.call(failureCallback, el, http);
                        }
                    }
                });
            }
        }

    });

    // auto register
    Ratchet.TemplateEngineRegistry.register("jquerytmpl", new Ratchet.jQueryTemplateEngine("jquerytmpl"));

})(jQuery);