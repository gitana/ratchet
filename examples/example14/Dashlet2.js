(function($)
{
    Dashlet2 = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            var self = this;

            // define a route
            this.get("/", function(el) {

                // load config
                $.ajax({
                    url: "/examples/example14/dashlet2-config.json",
                    "dataType": "json",
                    success: function(config)
                    {
                        el.model["config"] = config;

                        el.transform("/examples/example14/dashlet2", el.model, function(el) {
                            el.swap();
                        });
                    }
                });
            });
        }
    });

    Ratchet.GadgetRegistry.register("dashlet2", Dashlet2);

})(jQuery);