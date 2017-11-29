(function()
{
    /**
     * Provides a wrapper around HTML local storage.
     *
     * @param category
     *
     * @return storage instance
     * @constructor
     */
    Ratchet.Storage = Base.extend({

        constructor: function(category)
        {
            this.base();

            this.category = category;

            var NAME = this._NAME = "RATCHET_STORAGE";
            var internalStorage = this._internalStorage = window.localStorage;

            // wraps a storage object around an category
            var storage = {};
            storage.removeItem = function(key)
            {
                var json = null;

                var v = internalStorage.getItem(NAME);
                if (!v) {
                    json = {};
                } else {
                    json = JSON.parse("" + v);
                }

                delete json[category + "/" + key];

                internalStorage.setItem(NAME, JSON.stringify(json));
            };
            storage.getItem = function(key)
            {
                var json = null;

                var v = internalStorage.getItem(NAME);
                if (!v) {
                    json = {};
                } else {
                    json = JSON.parse("" + v);
                }

                return json[category + "/" + key];
            };
            storage.setItem = function(key, value)
            {
                var json = null;

                var v = internalStorage.getItem(NAME);
                if (!v) {
                    json = {};
                } else {
                    json = JSON.parse("" + v);
                }

                json[category + "/" + key] = value;

                internalStorage.setItem(NAME, JSON.stringify(json));
            };

            this._storage = storage;
        },

        clear: function()
        {
            // we first set to empty to account for a bug in Chrome
            // this bug is with the removeItem method where it sometimes doesn't work, so force to empty to handle worst case
            // https://bugs.chromium.org/p/chromium/issues/detail?id=765524
            this._internalStorage.setItem(this.NAME, "");
            this._internalStorage.removeItem(this.NAME);
        },

        /**
         * Pokes and peeks the value of a key in the state.
         *
         * @param key
         * @param value
         *
         * @return {*}
         */
        poke: function(key, value)
        {
            if (typeof(value) !== "undefined" && value !== null)
            {
                this._storage.setItem(key, value);
            }
            else if (value === null)
            {
                this._storage.removeItem(key);
            }

            return this._storage.getItem(key);
        }
    });

})();