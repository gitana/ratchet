define(function() {

    var interval = 50;

    var regCount = 0;

    var handlers = [];

    var hash = window.location.href;
    var first = true;

    var triggerHandlers = function(hash, oldHash)
    {
        for (var i = 0; i < handlers.length; i++)
        {
            handlers[i](hash, oldHash);
        }
    };

    var checkForHashChange = function()
    {
        var newHash = window.location.href;
        if (newHash !== hash)
        {
            var oldHash = hash;
            hash = newHash;

            triggerHandlers(hash, oldHash);
        }
    };

    var poll = setInterval(checkForHashChange, interval);

    // hash object that we hand back
    var r = {};

    r.getHash = function()
    {
        return hash;
    };

    r.setHash = function(newHash)
    {
        if (first)
        {
            first = false;

            var oldHash = hash;
            hash = newHash;

            window.location.hash = newHash;

            if (oldHash === hash)
            {
                triggerHandlers(hash, oldHash);
            }
        }
        else
        {
            window.location.hash = newHash;
        }
    };

    r.register = function(handler)
    {
        handler._regId = ("handler-" + (++regCount));
        handlers.push(handler);
    };

    r.unregister = function(handler)
    {
        if (handler._regId)
        {
            var badIndex = -1;
            for (var i = 0; i < handlers.length; i++)
            {
                if (handlers[i]._regId === _handler._regId)
                {
                    badIndex = i;
                    break;
                }
            }

            if (badIndex > -1)
            {
                handlers.splice(badIndex, 1);
            }
        }
    };

    r.trigger = function()
    {
        triggerHandlers(hash, hash);
    };

    return r;

});
