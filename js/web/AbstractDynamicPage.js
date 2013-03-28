(function($) {
    Ratchet.AbstractDynamicPage = Ratchet.Gadget.extend(
    {
        index: function(el)
        {
            this.doIndex(el);
        },

        /**
         * To be implemented by implementation class.
         *
         * @extension_point
         *
         * @param el
         */
        doIndex: function(el)
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

})(jQuery);