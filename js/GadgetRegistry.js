(function()
{
    var gadgetRegistry = {};

    Ratchet.GadgetRegistry = {

        /**
         *
         * @param type
         * @param id (optional)
         * @param classObject
         * @returns {*}
         */
        register: function(type, id, classObject)
        {
            // id is optional
            if (!classObject)
            {
                classObject = id;
                id = null;
            }

            if (!gadgetRegistry[type]) {
                gadgetRegistry[type] = [];
            }

            var registration = {
                "classObject": classObject
            };
            if (id) {
                registration.id = id;
            }

            gadgetRegistry[type].push(registration);

            return classObject;
        },

        deregister: function(type, id)
        {
            var types = gadgetRegistry[type];
            if (types)
            {
                for (var i = 0; i < types.length; i++)
                {
                    var registration = types[i];
                    if (registration)
                    {
                        if (registration.id == id)
                        {
                            types.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        },

        list: function(type)
        {
            var list = [];

            var registrations = gadgetRegistry[type];
            if (registrations)
            {
                for (var i = 0; i < registrations.length; i++)
                {
                    list.push(registrations[i].classObject);
                }
            }

            return list;
        },

        /**
         * Instantiates any gadgets for the given type and optional ID.
         *
         * If an ID is provided, then this method instantiates any gadgets for the given type and instance.
         * If none are found, then type instances are handed back instead.
         *
         * If no ID is provided, then type instances are handed back.
         *
         * @param type
         * @param id
         * @param ratchet
         * @returns {Array}
         */
        instantiate: function(type, id, ratchet)
        {
            if (!ratchet)
            {
                ratchet = id;
                id = null;
            }

            // if we don't have an assignable gadget ID, we generate one here
            var gadgetId = id;
            if (!gadgetId)
            {
                gadgetId = Ratchet.generateGadgetId();
            }

            var instances = [];

            // registrations
            var registrations = gadgetRegistry[type];
            if (registrations)
            {
                // if we have an ID, then try to produce instance matches
                // if no instance matches found, we hand back type-only matches
                if (id)
                {
                    for (var i = 0; i < registrations.length; i++)
                    {
                        var registration = registrations[i];

                        if (id && registration.id && id == registration.id)
                        {
                            var classObject = registration.classObject;

                            var instance = new classObject(type, ratchet, gadgetId);
                            instances.unshift(instance); // inserts at front
                        }
                    }
                }

                // fallback to type only matches
                if (!id || instances.length == 0)
                {
                    // produce type only matches
                    for (var i = 0; i < registrations.length; i++)
                    {
                        var registration = registrations[i];
                        if (!registration.id)
                        {
                            var classObject = registration.classObject;

                            var instance = new classObject(type, ratchet, gadgetId);
                            instances.unshift(instance); // inserts at front
                        }
                    }
                }
            }

            return instances;
        }

    };

})();
