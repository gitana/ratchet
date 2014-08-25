/*jshint -W004 */ // duplicate variables
(function($)
{
    Ratchet.DynamicRegionResolver = Base.extend(
    {
        constructor: function(config)
        {
            this.base();

            this.config = config;
        },

        /**
         * Resolves a region to a gadget.
         *
         * @param context
         * @param regions
         * @param callback
         */
        resolve: function(context, regions, callback)
        {
            var self = this;

            var resolutions = {};

            if (regions)
            {
                for (var regionName in regions)
                {
                    var x = this.config.regions[regionName];
                    if (x)
                    {
                        var array = [];

                        // we either have a single match or an array
                        if (x.push)
                        {
                            for (var i = 0; i < x.length; i++)
                            {
                                var resolution = {
                                    "type": x[i].gadgetType,
                                    "id": x[i].gadget,
                                    "attrs": {}
                                };

                                array.push(resolution);
                            }
                        }
                        else
                        {
                            var resolution = {
                                "type": x.gadgetType,
                                "id": x.gadget,
                                "attrs": {}
                            };

                            array.push(resolution);
                        }

                        resolutions[regionName] = array;
                    }

                    // allow for overrides via configuration
                    if (Ratchet.Configuration)
                    {
                        var config = null;

                        var ctx = {};
                        ctx.observable = context.observable;

                        var baseConfig = Ratchet.Configuration.evaluate(ctx);
                        if (baseConfig)
                        {
                            config = Ratchet.resolveDotNotation(baseConfig, "regions." + regionName);
                        }
                        if (config)
                        {
                            var array = [];

                            var resolution = {
                                "type": config.type,
                                "attrs": {}
                            };

                            array.push(resolution);

                            resolutions[regionName] = array;
                        }
                    }
                }
            }

            callback.call(self, resolutions);
        }
    });

})(jQuery);