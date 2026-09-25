(function($)
{
    Ratchet.ScopedObservables = {};
    Ratchet.ScopedObservables.map = {};

    Ratchet.ScopedObservables.get = function(scope)
    {
        if (!Ratchet.ScopedObservables.map[scope])
        {
            Ratchet.ScopedObservables.map[scope] = new Ratchet.Observables(scope);
        }

        return Ratchet.ScopedObservables.map[scope];
    };

})(jQuery);
