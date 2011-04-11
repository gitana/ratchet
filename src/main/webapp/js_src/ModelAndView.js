(function($)
{
    MVC.ModelAndView = MVC.Abstract.extend(
    {
        constructor: function()
        {
            this.base();

            var model = {};
            var view = null;
            var tokens = {};
            var data = null;

            this._getModel = function()
            {
                return model;
            };

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
        },

        set: function(key, value)
        {
            this.getModel()[key] = value;
        },

        get: function(key)
        {
            return this.getModel()[key];
        },

        getModel: function()
        {
            return this._getModel();
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