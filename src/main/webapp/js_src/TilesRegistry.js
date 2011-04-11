(function($)
{
    MVC.TilesRegistry = {};
    MVC.TilesRegistry.registry = {};
    MVC.TilesRegistry.register = function(definitionsObject)
    {
        for (var name in definitionsObject)
        {
            // TODO: check for duplicate declarations?

            MVC.TilesRegistry.registry[name] = definitionsObject[name]
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
     */
    MVC.TilesRegistry.load = function(name)
    {
        var compiled = {};

        var entry = MVC.TilesRegistry.registry[name];
        MVC.TilesRegistry.compile(entry, compiled);

        return compiled;
    },

    MVC.TilesRegistry.compile = function(entry, compiled)
    {
        var parent = entry["extends"];

        if (parent)
        {
            var parentEntry= MVC.TilesRegistry.registry[parent];
            if (parentEntry)
            {
                // recurse
                MVC.TilesRegistry.compile(parentEntry, compiled);
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
