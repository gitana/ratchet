(function($)
{
    Dashboard = Ratchet.Gadget.extend(
    {
        setup: function()
        {
            var self = this;

            // define a route
            this.get("/", function(el) {

                // load config
                $.ajax({
                    url: "/examples/example14/dashboard-config.json",
                    "dataType": "json",
                    success: function(config)
                    {
                        el.model["config"] = config;

                        el.transform("/examples/example14/dashboard", el.model, function(el) {
                            el.swap();
                        });
                    }
                });

            });
        }
    });

    Ratchet.GadgetRegistry.register("dashboard", Dashboard);

})(jQuery);