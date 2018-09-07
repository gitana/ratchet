define(["../Ratchet"], function(Ratchet) {

    var handlers = [];

    Ratchet.ErrorHandlerRegistry = {

        register: function(handler)
        {
            // add to handlers
            handlers.push(handler);

            // sort handlers
            handlers.sort(function(a, b) {

                if (a.getOrder() < b.getOrder()) {
                    return -1;
                }

                if (a.getOrder() > b.getOrder()) {
                    return 1;
                }

                return 0;
            });

            return handler;
        },

        findHandler: function(err)
        {
            var handler = null;

            for (var i = 0; i < handlers.length; i++)
            {
                if (handlers[i].canHandle(err))
                {
                    handler = handlers[i];
                    break;
                }
            }

            return handler;
        }
    };

});