(function($)
{
    // template cache
    if (typeof(Ratchet.TemplateCache) == "undefined") {
        Ratchet.TemplateCache = {};
    }

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

        renderUri: function(el, uri, model, successCallback, failureCallback)
        {
            return this.render(el, "uri", uri, uri, model, successCallback, failureCallback);
        },

        /**
         * Renders a template.
         *
         * @param el
         * @param type either "url", "selector", "html"
         * @param value either the URL, selector string or HTML body
         * @param cacheKey
         * @param model
         * @param successCallback
         * @param failureCallback
         */
        render: function(el, type, value, cacheKey, model, successCallback, failureCallback)
        {
            var self = this;

            var renderCallback = function(err, html)
            {
                if (err) {
                    failureCallback.call(failureCallback, el, err);
                    return;
                }

                $(el).html("");
                $(el).append(html);

                if (successCallback)
                {
                    successCallback.call(successCallback, el)
                }
            };

            // if they're using a selector, we can pick out the html right here and pass forward
            if (type == "selector" || type == "html")
            {
                var html = value;
                if (type == "selector") {
                    html = $(el).select(value).html();
                }

                this.doRender(el, cacheKey, html, model, renderCallback);
            }
            else if (type == "url" || type == "uri")
            {
                var fileExtension = self.fileExtension();

                var url = value;
                if (url.indexOf("." + fileExtension) == -1) {
                    url += "." + fileExtension;
                }

                $.ajax({
                    "url": url,
                    "dataType": "html",
                    "success": function(html)
                    {
                        // cleanup html
                        html = self.cleanMarkup(el, html);

                        self.doRender(el, cacheKey, html, model, renderCallback);
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
            else
            {
                failureCallback.call(failureCallback, new Error("Unknown render type: " + type));
            }

        },

        fileExtension: function() {
            return "html";
        },

        /**
         * EXTENSION POINT
         *
         * @param el
         * @param name (used for caching)
         * @param html
         * @param model
         * @param callback
         */
        doRender: function(el, name, html, model, callback)
        {

        }

    });

})(jQuery);