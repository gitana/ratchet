define(["ratchet/ratchet", "base"], function(Ratchet, Base) {

    var registry = {};

    var registryClass = Base.extend({

        constructor: function()
        {
            this.base();
        },

        /**
         * Registers a previewer.
         *
         * @param id
         * @param previewerClass
         */
        register: function(id, previewerClass)
        {
            var instance = new previewerClass();
            registry[id] = instance;

            instance.configure(id);

            return previewerClass;
        },

        /**
         * Finds all of the previewers that can execute given a condition.
         *
         * @param condition
         */
        lookupHandlers: function(condition)
        {
            var matches = [];

            for (var id in registry)
            {
                var previewer = registry[id];

                if (previewer.canHandle(condition))
                {
                    matches.push(previewer);
                }
            }

            // sort matches by priority
            matches.sort(function(a, b) {
                return (b.priority() - a.priority());
            });

            return matches;
        }

    });

    Ratchet.ViewerRegistry = new registryClass();

    return Ratchet.ViewerRegistry;

});
