(function($)
{
    Ratchet.ControllerRegistry = {};
    Ratchet.ControllerRegistry.registry = {};

    Ratchet.ControllerRegistry.register = function(id, classObject)
    {
        Ratchet.ControllerRegistry.registry[id] = classObject;
    };

    Ratchet.ControllerRegistry.produce = function(id, dispatcher)
    {
        var instance = null;

        var classObject = Ratchet.ControllerRegistry.registry[id];
        if (classObject)
        {
            instance = new classObject(dispatcher);

            instance.registerMappings();
        }

        return instance;
    };

})(jQuery);
