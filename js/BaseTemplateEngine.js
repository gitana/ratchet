(function($)
{
    Ratchet.BaseTemplateEngine = Base.extend(
    {
        constructor: function(id)
        {
            this.base();

            this.id = id;

            this.cleanMarkup = function(el, html)
            {
                // convert to a dom briefly
                var dom = $(html);

                // if if starts with a script tag, then we strip that out
                if ($(dom).length == 1)
                {
                    if ($(dom)[0].nodeName.toLowerCase() == "script")
                    {
                        html = $(dom).html();
                    }
                }

                return html;
            }
        },

        /**
         * Renders a template.
         *
         * @param templateId
         */
        render: function(el, templateId, model, successCallback, failureCallback)
        {
            this.doRender(el, templateId, model, successCallback, failureCallback);
        },

        /**
         * EXTENSION POINT
         *
         * @param el
         * @param templateId
         * @param model
         * @param successCallback
         * @param failureCallback
         */
        doRender: function(el, templateId, model, successCallback, failureCallback)
        {

        }

    });

})(jQuery);