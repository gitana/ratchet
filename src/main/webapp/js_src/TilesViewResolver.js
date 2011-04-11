(function($)
{
    MVC.TilesViewResolver = MVC.ViewResolver.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);

            // take over all view mappings
            this.register("**", this.tiles);
        },

        tiles: function(modelAndView)
        {
            this.renderTemplate(modelAndView);
        },

        renderTemplate: function(modelAndView)
        {
            var _this = this;

            // get the view that we want to render
            // we assume "index" for root paths
            var view = modelAndView.getView();

            // fetch the compiled definition
            var definition = MVC.TilesRegistry.load(view);
            if (definition)
            {
                // store definition onto the model
                modelAndView["tiles"] = definition;

                // clear the element
                $(_this.getEl()).html("");

                // render the template (starting point)
                this.renderTilesDefinition(_this.getEl(), modelAndView, definition, definition["template"]);
            }
            else
            {
                alert("No definition: " + view);
            }
        },

        renderTilesDefinition: function(container, modelAndView, definition, templateURL)
        {
            var _this = this;

            var isAttribute = (!definition);

            //
            // see if we can convert any relative URLs into absolute URLs
            //
            if (this.startsWith(templateURL, "/") || this.startsWith(templateURL, "http"))
            {
                // assume it is an absolute path
            }
            else
            {
                // assume it is a relative path
                var basePath = window.location.href;
                if (basePath.indexOf("#") > -1)
                {
                    basePath = basePath.substring(0, basePath.indexOf("#"));
                }

                if (basePath.lastIndexOf("/") > -1)
                {
                    basePath = basePath.substring(0, basePath.lastIndexOf("/")) + "/";
                }
                else
                {
                    basePath = "/";
                }

                templateURL = basePath + templateURL;
            }

            //
            // load the template
            //
            $.ajax({
                "dataType": "html",
                "url": templateURL,
                "success": function(html) {

                    // data model for template
                    var data = {
                        "model": modelAndView
                    };

                    // clear out our container
                    $(container).html("");

                    // use a temporary container to process the div, then append in
                    var temp = $("<div></div>");
                    $(temp).append(html);
                    var rendered = $(temp).tmpl(data);
                    $(temp).remove();

                    // if we're doing the top most item, use an append
                    // otherwise, replace the span or div tag completely
                    if (!isAttribute)
                    {
                        $(rendered).appendTo(container);
                    }
                    else
                    {
                        $(rendered).replaceAll(container);
                    }



                    // now look for any attribute tile-classes on the generated stuff and enhance
                    if (definition)
                    {
                        for (var attributeName in definition.attributes)
                        {
                            var url = definition.attributes[attributeName];

                            console.log(attributeName);

                            $.each($(container).find(".tile-" + attributeName), function() {

                                _this.renderTilesDefinition($(this), modelAndView, null, url);

                            });
                        }
                    }
                }
            });
        }

    });

    MVC.ViewResolverRegistry.register("tiles", MVC.TilesViewResolver);

})(jQuery);