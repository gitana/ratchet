define(["../Ratchet", "base"], function(Ratchet, Base) {

    Ratchet.AbstractErrorHandler = Base.extend({

        constructor: function()
        {
        },

        /**
         * EXTENSION_POINT
         *
         * @param err
         * @returns {boolean}
         */
        canHandle: function(err)
        {
            return false;
        },

        /**
         * EXTENSION_POINT
         *
         * @returns {number}
         */
        getOrder: function()
        {
            return 500;
        },

        /**
         * EXTENSION_POINT
         *
         * @param err
         * @returns {boolean}
         */
        handle: function(err, onClose)
        {

        }

    });

});