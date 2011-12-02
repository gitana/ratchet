(function($)
{
    Ratchet.jQueryTemplateEngine = Base.extend(
    {
        constructor: function(id)
        {
            this.base();

            this.id = id;
        },

        /**
         * Renders a template.
         *
         * @param templateId
         */
        render: function(el, templateId, model, successCallback, failureCallback)
        {
            var _this = this;

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
                        // convert to a dom briefly
                        // this is because it starts with <script> and we only want what is inside
                        var dom = $(html);
                        html = dom.html();

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

})(jQuery);