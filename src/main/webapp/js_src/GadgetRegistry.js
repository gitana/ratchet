(function($)
{
    Ratchet.GadgetRegistry = {};
    Ratchet.GadgetRegistry.registry = {};

    /**
     * Classifies a gadget implementation class as being of a particular type (i.e. "sidebar").
     *
     * @param type
     * @param classObject
     */
    Ratchet.GadgetRegistry.register = function(type, classObject)
    {
        if(!Ratchet.GadgetRegistry.registry[type])
        {
            Ratchet.GadgetRegistry.registry[type] = [];
        }

        Ratchet.GadgetRegistry.registry[type].push(classObject);
    };

    /**
     * Instantiates all of the gadgets of a particular type and hands back an array.
     *
     * @param id
     * @param ratchet
     * @param container
     */
    Ratchet.GadgetRegistry.instantiate = function(type, ratchet, container)
    {
        var instances = [];

        var classObjects = Ratchet.GadgetRegistry.registry[type];
        if (classObjects)
        {
            $.each(classObjects, function(index, classObject) {

                var instance = new classObject(ratchet, container);
                instances.push(instance);

            });
        }

        return instances;
    };

})(jQuery);
