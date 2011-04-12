(function($)
{
    Ratchet.GadgetRegistry = {};
    Ratchet.GadgetRegistry.registry = {};

    Ratchet.GadgetRegistry.register = function(id, classObject)
    {
        Ratchet.GadgetRegistry.registry[id] = classObject;
    };

    Ratchet.GadgetRegistry.produce = function(id, dispatcher, container)
    {
        var instance = null;

        var classObject = Ratchet.GadgetRegistry.registry[id];
        if (classObject)
        {
            instance = new classObject(dispatcher, container);
        }

        return instance;
    };

})(jQuery);
