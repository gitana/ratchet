(function($)
{
    Ratchet.GadgetRegistry = {};
    Ratchet.GadgetRegistry.registry = {};

    Ratchet.GadgetRegistry.register = function(id, classObject)
    {
        Ratchet.GadgetRegistry.registry[id] = classObject;
    };

    Ratchet.GadgetRegistry.produce = function(id, ratchet, container)
    {
        var instance = null;

        var classObject = Ratchet.GadgetRegistry.registry[id];
        if (classObject)
        {
            instance = new classObject(ratchet, container);
        }

        return instance;
    };

})(jQuery);
