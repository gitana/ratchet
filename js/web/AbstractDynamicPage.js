(function($) {
    Ratchet.AbstractDynamicPage = Ratchet.Gadget.extend(
    {
        index: function(el)
        {
            var self = this;

            // call over to server to load page information
            var uri = el.route.uri;
            $.ajax({
                url: "/_pages" + uri,
                "dataType": "json",
                success: function(config)
                {
                    //self.observable(self.subscription).set(config);

                    self.observable("application").set(config.application);
                    self.observable("page").set(config.page);
                    self.observable("bindings").set(config.bindings);
                    self.observable("gadgets").set(config.gadgets);
                    self.observable("template").set(config.template);
                    self.observable("view").set(config.view);

                    // for each gadget runtime config, binding into observable
                    for (var gadgetSubscriberKey in config.gadgets)
                    {
                        var gadget = config.gadgets[gadgetSubscriberKey];

                        self.observable("gadget_" + gadgetSubscriberKey).set(gadget);
                    }

                    // plug in a region resolver
                    Ratchet.regionResolver = new Ratchet.DynamicRegionResolver(config);

                    // update page title
                    var title = config.application.title;
                    if (config.page.title)
                    {
                        title += " - " + config.page.title;
                    }
                    $("title").html(title);

                    // template
                    //var template = "custom/templates/" + config.template.path;
                    var template = "templates/" + config.template.path;

                    // render
                    self.renderTemplate(el, template, function(el) {
                        el.swap();
                    });
                }
            });
        },

        renderTemplate: function(el, templatePath, data, callback) {

            //if (templatePath.indexOf('/') != 0) {
                //var prefix = "app";
                //templatePath = prefix + "/" + templatePath;
            //}

            if (data && callback) {
                el.transform(templatePath, data, function(el) {
                    callback(el);
                });
            } else {
                callback = data;
                el.transform(templatePath, function(el) {
                    callback(el);
                });
            }
        }

    });

})(jQuery);