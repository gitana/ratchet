define(["./Ratchet", "base"], function(Ratchet, Base) {

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

            for (var regionName in regions)
            {
                var gadgetType = mappings[regionName];
                if (gadgetType)
                {
                    var array = [];

                    var resolution = {
                        "type": gadgetType,
                        "attrs": {}
                    };

                    array.push(resolution);

                    resolutions[regionName] = array;
                }
            }

            callback.call(self, resolutions);
        }
    });

});