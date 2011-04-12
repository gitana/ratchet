(function($)
{
    Ratchet.ModelAndView = Ratchet.Abstract.extend(
    {
        constructor: function(observationPool)
        {
            var _this = this;

            this.base();

            this.observationPool = observationPool;

            // private variables
            var view = null;
            var tokens = {};
            var data = null;

            this._getView = function()
            {
                return view;
            };

            this._setView = function(v)
            {
                view = v;
            };

            this._getTokens = function()
            {
                return tokens;
            };

            this._setTokens = function(t)
            {
                tokens = t;
            };

            this._getData = function()
            {
                return data;
            };

            this._setData = function(d)
            {
                data = d;
            };

            this._observable = function(id, value)
            {
                return _this.observationPool.observable(id, value);
            };

            this._dependentObservable = function(id, func, pool)
            {
                return _this.observationPool.dependentObservable(id, func, pool);
            };

        },

        observable: function(id, value)
        {
            return this._observable(id, value);
        },

        dependentObservable: function(id, func, pool)
        {
            return this._dependentObservable(id, func, pool);
        },

        getView: function()
        {
            return this._getView();
        },

        setView: function(view)
        {
            this._setView(view);
        },

        getToken: function(token)
        {
            return this.getTokens()[token];
        },

        getTokens: function()
        {
            return this._getTokens();
        },

        setTokens: function(tokens)
        {
            this._setTokens(tokens);
        },

        getData: function()
        {
            return this._getData();
        },

        setData: function(data)
        {
            this._setData(data);
        }
    });

})(jQuery);