(function($)
{
    Ratchet.ObservationPool = Base.extend(
    {
        constructor: function()
        {
            this.base();

            this.observables = {};
        },

        observable: function(id, initialValue)
        {
            if (!this.observables[id])
            {
                var observable = new Ratchet.Observable();

                if (initialValue)
                {
                    observable.set(initialValue);
                }

                this.observables[id] = observable;
            }

            return this.observables[id];
        },

        dependentObservable: function(id, func, pool)
        {
            if (!this.observables[id])
            {
                var observable = this.observable(id);

                // wrap the model
                var m = new Ratchet.Model(pool);
                m.observable = function(x, y)
                {
                    var o = this._observable(x, y);
                    o.markDependentOnUs(observable);

                    return o;
                };

                // create the value function (where "this" = the model)
                var valueFunction = function() {
                    return func.call(m);
                };

                observable.setValueFunction(valueFunction);
            }

            return this.observables[id];
        },

        getObservables: function()
        {
            return this.observables;
        },

        remove: function(id)
        {
            delete this.observables[id];
        }

    });

})(jQuery);