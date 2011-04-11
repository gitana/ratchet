(function($)
{
    Ratchet.TilesRegistry = {};
    Ratchet.TilesRegistry.registry = {};
    Ratchet.TilesRegistry.register = function(definitionsObject)
    {
        for (var name in definitionsObject)
        {
            // TODO: check for duplicate declarations?

            Ratchet.TilesRegistry.registry[name] = definitionsObject[name]
        }
    };

    /**
     * NOTE: the compiled/loaded result comes back like this:
     *
        {
            "home": {
                "template": "/templates/front.html",
                "attributes": {
                    "head": "/head.html",
                    "navigation": "/navigation.html",
                    "footer": "/footer.html",
                    "sidebar": "/sidebar.html"
                }
            }
        }

     NOTE: it can come back null if no definition with this name found
     */
    Ratchet.TilesRegistry.load = function(name)
    {
        var compiled = null;

        var entry = Ratchet.TilesRegistry.registry[name];
        if (entry)
        {
            compiled = {};
            Ratchet.TilesRegistry.compile(entry, compiled);
        }

        return compiled;
    },

    Ratchet.TilesRegistry.compile = function(entry, compiled)
    {
        var parent = entry["extends"];

        if (parent)
        {
            var parentEntry= Ratchet.TilesRegistry.registry[parent];
            if (parentEntry)
            {
                // recurse
                Ratchet.TilesRegistry.compile(parentEntry, compiled);
            }
        }

        // copy attributes into compiled
        if (entry.attributes)
        {
            for (var key in entry.attributes)
            {
                if (!compiled.attributes)
                {
                    compiled.attributes = {};
                }
                compiled["attributes"][key] = entry.attributes[key];
            }
        }

        // copy template
        if (entry.template)
        {
            compiled.template = entry.template;
        }
    };

})(jQuery);
