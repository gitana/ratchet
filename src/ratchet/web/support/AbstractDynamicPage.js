define(["ratchet/ratchet"], function(Ratchet) {

    return Ratchet.AbstractDynamicPage = Ratchet.Gadget.extend(
    {
        index: function(el, callback)
        {
            this.doIndex(el, callback);
        },

        /**
         * To be implemented by implementation class.
         *
         * @extension_point
         *
         * @param el
         * @param callback
         */
        doIndex: function(el, callback)
        {
        },

        renderTemplate: function(el, templateIdentifier, data, callback) {

            if (data && callback) {
                el.transform(templateIdentifier, data, function(el) {
                    callback(el);
                });
            } else {
                callback = data;
                el.transform(templateIdentifier, function(el) {
                    callback(el);
                });
            }
        }

    });

});