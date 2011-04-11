(function($)
{
    MVC.ViewResolverRegistry = {};
    MVC.ViewResolverRegistry.registry = {};
    MVC.ViewResolverRegistry.register = function(id, classObject)
    {
        MVC.ViewResolverRegistry.registry[id] = classObject;
    };

    MVC.ViewResolverRegistry.produce = function(id, dispatcher)
    {
        var instance = null;

        var classObject = MVC.ViewResolverRegistry.registry[id];
        if (classObject)
        {
            instance = new classObject(dispatcher);
        }

        return instance;
    };

})(jQuery);
