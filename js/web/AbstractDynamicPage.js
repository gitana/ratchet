(function($) {
    Ratchet.AbstractDynamicPage = Ratchet.Gadget.extend(
    {
        index: function(el)
        {
            var self = this;

            // call over to server to load page information
            var uri = el.route.uri;
            $.ajax({
                url: "/_page" + uri,
                "dataType": "json",
                success: function(config)
                {
                    //self.observable(self.subscription).set(config);

                    self.observable("application").set(config.application);
                    self.observable("page").set(config.page);
                    self.observable("gadgets").set(config.gadgets);

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
                    //var template = "templates/" + config.template.path;
                    var template = "templates/" + config.template;

                    // render
                    self.renderTemplate(el, template, function(el) {
                        el.swap();
                    });
                }
            });
        },

        renderTemplate: function(el, templateIdentifier, data, callback) {

            if (data && callback) {
                el.transform(templateIdentifier, data, function(el) {
                    callback(el);
                });
            } else {
                callback = data;
                el.transform(templateIdentifier, function(el) {
                    callback(el);
                });
            }
        }

    });

})(jQuery);