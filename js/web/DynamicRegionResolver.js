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

            var page = context.observable("page").get();

            var resolutions = {};

            for (var regionName in regions)
            {
                var x = page.bindings[regionName];
                if (x)
                {
                    var array = [];

                    // we either have a single match or an array
                    if (x.push)
                    {
                        for (var i = 0; i < x.length; i++)
                        {
                            var resolution = {
                                "type": x[i].type,
                                "id": x[i].key,
                                "attrs": {}
                            };

                            array.push(resolution);
                        }
                    }
                    else
                    {
                        var resolution = {
                            "type": x.type,
                            "id": x.key,
                            "attrs": {}
                        };

                        array.push(resolution);
                    }

                    resolutions[regionName] = array;
                }
            }

            callback.call(self, resolutions);
        }
    });

})(jQuery);