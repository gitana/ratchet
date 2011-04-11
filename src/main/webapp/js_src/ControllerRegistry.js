(function($)
{
    MVC.ControllerRegistry = {};
    MVC.ControllerRegistry.registry = {};

    MVC.ControllerRegistry.register = function(id, classObject)
    {
        MVC.ControllerRegistry.registry[id] = classObject;
    };

    MVC.ControllerRegistry.produce = function(id, dispatcher)
    {
        var instance = null;

        var classObject = MVC.ControllerRegistry.registry[id];
        if (classObject)
        {
            instance = new classObject(dispatcher);
        }

        return instance;
    };

})(jQuery);
