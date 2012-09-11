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
     * Instantiates any gadgets for the given gadget type.
     *
     * @param type
     * @param id
     * @param ratchet
     */
    Ratchet.GadgetRegistry.instantiate = function(type, id, ratchet)
    {
        var instances = [];

        var classObjects = Ratchet.GadgetRegistry.registry[type];
        if (classObjects)
        {
            $.each(classObjects, function(index, classObject) {

                var instance = new classObject(type, ratchet, id);
                instances.push(instance);
            });
        }

        return instances;
    };

})(jQuery);
