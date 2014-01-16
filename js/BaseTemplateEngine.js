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
                // replace img "src" attributes with "no_load_src" attribute
                html = html.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {return "<img no_load_src=\"" +capture+ "\" />";});

                // wrap in div tag to convert to dom (in case starts with {} tags)
                html = "<div>" + html + "</div>";

                // convert to a dom briefly
                var dom = $(html);

                // pop out the div wrapper tags
                dom = dom.children()[0];

                // if if starts with a script tag, then we strip that out
                if ($(dom).length == 1)
                {
                    if ($(dom)[0].nodeName.toLowerCase() == "script")
                    {
                        html = $(dom).html();
                    }
                }

                // replace img "no_load_src" attributes with "src" attribute
                html = html.replace(/<img [^>]*no_load_src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {return "<img src=\"" +capture+ "\" />";});

                return html;
            };
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
                    successCallback.call(successCallback, el);
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

                var html = self.retrievePreloadedJST(url);
                if (html)
                {
                    // cleanup html
                    html = self.cleanMarkup(el, html);

                    self.doRender(el, cacheKey, html, model, renderCallback);
                }
                else
                {
                    // load from ajax
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

        },

        /**
         * Extension point for handing back a preloaded JST html string for a given uri.
         *
         * @param url
         */
        retrievePreloadedJST: function(url)
        {
            var self = this;

            var html = null;

            if (window && window.JSTTemplates)
            {
                var name = url;

                // strip front "/" if it exists
                if (name.substring(0,1) == "/")
                {
                    name = name.substring(1);
                }

                // remove extension if it exists
                var extensionIndex = name.indexOf("." + self.fileExtension());
                if (extensionIndex > -1)
                {
                    name = name.substring(0, extensionIndex);
                }

                html = window.JSTTemplates[name];
            }

            return html;
        }

    });

})(jQuery);