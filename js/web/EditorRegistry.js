(function() {

    var keys = [];
    var registry = {};

    var registryClass = Base.extend({

        constructor: function()
        {
            this.base();
        },

        /**
         * Registers an editor.
         *
         * @param id
         * @param editorClass
         */
        register: function(id, editorClass)
        {
            var instance = new editorClass();
            registry[id] = instance;
            keys.push(id);

            instance.configure(id);

            return editorClass;
        },

        /**
         * Finds all of the editors that can render for a given condition.
         *
         * @param condition
         */
        lookupHandlers: function(condition)
        {
            var matches = [];

            for (var i = 0; i < keys.length; i++)
            {
                var key = keys[i];

                var editor = registry[key];

                if (editor.canHandle(condition))
                {
                    matches.push(editor);
                }
            }

            return matches;
        }

    });

    Ratchet.EditorRegistry = new registryClass();

    return Ratchet.EditorRegistry;

})();
