(function()
{
    var gadgetRegistry = {};

    Ratchet.GadgetRegistry = {

        register: function(type, classObject)
        {
            if (!gadgetRegistry[type]) {
                gadgetRegistry[type] = [];
            }

            gadgetRegistry[type].push(classObject);

            return classObject;
        },

        list: function(type)
        {
            return gadgetRegistry[type];
        },

        instantiate: function(type, ratchet, id)
        {
            var instances = [];

            var classObjects = gadgetRegistry[type];
            if (classObjects)
            {
                for (var i = 0; i < classObjects.length; i++)
                {
                    var classObject = classObjects[i];

                    var instance = new classObject(type, ratchet, id);
                    instances.push(instance);

                }
            }

            // we reverse the list so that defaults appear at the end
            // that way, we can override by URI
            return instances.reverse();
        }

    };

})();
