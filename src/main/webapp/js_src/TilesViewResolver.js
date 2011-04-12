(function($)
{
    Ratchet.TilesViewResolver = Ratchet.ViewResolver.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);
        },

        /**
         * @override
         */
        registerMappings: function()
        {
        },

        tiles: function(modelAndView)
        {
            $(this.getEl()).html("");

            this.renderTemplate(this.getEl(), modelAndView);
        },

        renderTemplate: function(container, modelAndView)
        {
            var _this = this;

            var view = modelAndView.getView();

            // fetch the compiled definition
            var definition = Ratchet.TilesRegistry.load(view);
            if (definition)
            {
                // store definition onto the model
                modelAndView["tiles"] = definition;

                // render the template (starting point)
                this.renderTilesDefinition(container, modelAndView, definition, definition["template"]);
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
                    // copy over properties from the model
                    var data = {};
                    //_this.copyInto(data, modelAndView.getVariables());

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

                            $.each($(container).find(".tile-" + attributeName), function() {

                                _this.renderTilesDefinition($(this), modelAndView, null, url);

                            });
                        }
                    }

                    // apply any other post-processing
                    _this.postProcess(modelAndView);
                }
            });
        },

        /**
         * @EXTENSION POINT
         *
         * @param modelAndView
         */
        postProcess: function(modelAndView)
        {

        }

    });

    Ratchet.ViewResolverRegistry.register("tiles", Ratchet.TilesViewResolver);

})(jQuery);