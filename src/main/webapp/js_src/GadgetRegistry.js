(function($)
{
    Ratchet.GadgetRegistry = {};
    Ratchet.GadgetRegistry.registry = {};

    /**
     * Classifies a gadget implementation class as being of a particular type (i.e. "sidebar").
     *
     * @param id
     * @param classObject
     */
    Ratchet.GadgetRegistry.register = function(id, classObject)
    {
        if(!Ratchet.GadgetRegistry.registry[id])
        {
            Ratchet.GadgetRegistry.registry[id] = [];
        }

        Ratchet.GadgetRegistry.registry[id].push(classObject);
    };

    /**
     * Instantiates any gadgets for the given gadget id.
     *
     * @param id
     * @param ratchet
     */
    Ratchet.GadgetRegistry.instantiate = function(id, ratchet)
    {
        var instances = [];

        var classObjects = Ratchet.GadgetRegistry.registry[id];
        if (classObjects)
        {
            $.each(classObjects, function(index, classObject) {

                var instance = new classObject(id, ratchet);
                instances.push(instance);
            });
        }

        return instances;
    };

})(jQuery);
