(function($)
{
    Ratchet.DefaultRegionResolver = Base.extend(
    {
        constructor: function(id)
        {
            this.base();

            this.id = id;
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

            var mappings = Ratchet.regionMappings;
            if (!mappings)
            {
                mappings = {};
            }

            var resolutions = {};

            for (var regionId in regions)
            {
                //var el = regions[regionId];

                var gadgetType = mappings[regionId];

                var attrs = {};

                var resolution = {
                    "gadgetType": gadgetType,
                    "attrs": attrs
                };

                resolutions[regionId] = resolution;
            }

            callback.call(self, resolutions);
        }
    });

})(jQuery);