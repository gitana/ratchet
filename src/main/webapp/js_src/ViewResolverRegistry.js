(function($)
{
    Ratchet.ViewResolverRegistry = {};
    Ratchet.ViewResolverRegistry.registry = {};
    Ratchet.ViewResolverRegistry.register = function(id, classObject)
    {
        Ratchet.ViewResolverRegistry.registry[id] = classObject;
    };

    Ratchet.ViewResolverRegistry.produce = function(id, dispatcher)
    {
        var instance = null;

        var classObject = Ratchet.ViewResolverRegistry.registry[id];
        if (classObject)
        {
            instance = new classObject(dispatcher);

            instance.registerMappings();
        }

        return instance;
    };

})(jQuery);
