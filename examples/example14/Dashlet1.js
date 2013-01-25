(function($)
{
    Dashlet1 = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            var self = this;

            // define a route
            this.get("/", function(el) {

                // load config
                $.ajax({
                    url: "dashlet1-config.json",
                    "dataType": "json",
                    success: function(config)
                    {
                        el.model["config"] = config;

                        el.transform("dashlet1", el.model, function(el) {
                            el.swap();
                        });
                    }
                });
            });
        }
    });

    Ratchet.GadgetRegistry.register("dashlet1", Dashlet1);

})(jQuery);