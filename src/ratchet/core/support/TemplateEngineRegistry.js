define(["./Ratchet"], function(Ratchet) {

    Ratchet.TemplateEngineRegistry = {};
    Ratchet.TemplateEngineRegistry.registry = {};

    /**
     * Registers a template engine.
     *
     * @param id
     * @param engine
     */
    Ratchet.TemplateEngineRegistry.register = function(id, engine)
    {
        Ratchet.TemplateEngineRegistry.registry[id] = engine;
    };

    /**
     * Retrieves a template engine by its id.
     *
     * @param id
     */
    Ratchet.TemplateEngineRegistry.find = function(id)
    {
        return Ratchet.TemplateEngineRegistry.registry[id];
    };

    /**
     * @return array of ids of all of the registered template engines
     */
    Ratchet.TemplateEngineRegistry.getIds = function()
    {
        var ids = [];

        for (var id in Ratchet.TemplateEngineRegistry.registry)
        {
            ids.push(id);
        }

        return ids;
    };

});
