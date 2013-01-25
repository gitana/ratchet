(function($)
{
    Dashlet3 = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            var self = this;

            // define a route
            this.get("/", function(el) {

                // load config
                $.ajax({
                    url: "dashlet3-config.json",
                    "dataType": "json",
                    success: function(config)
                    {
                        el.model["config"] = config;

                        el.transform("dashlet3", el.model, function(el) {
                            el.swap();
                        });
                    }
                });
            });
        }
    });

    Ratchet.GadgetRegistry.register("dashlet3", Dashlet3);

})(jQuery);