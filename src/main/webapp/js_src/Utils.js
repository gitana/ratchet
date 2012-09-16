(function()
{
    Ratchet.uniqueIdCounter = 0;

    /**
     * Builds an array from javascript method arguments.
     *
     * @inner
     *
     * @param {arguments} arguments
     *
     * @returns {Array} an array
     */
    Ratchet.makeArray = function(args) {
        return Array.prototype.slice.call(args);
    };

    /**
     * Serializes a object into a JSON string and optionally makes it pretty by indenting.
     *
     * @inner
     *
     * @param {Object} object The javascript object.
     * @param {Boolean} pretty Whether the resulting string should have indentation.
     *
     * @returns {String} string
     */
    Ratchet.stringify = function(object, pretty) {

        var val = null;
        if (pretty)
        {
            val = JSON.stringify(object, null, "  ");
        }
        else
        {
            val = JSON.stringify(object);
        }

        return val;
    };

    /**
     * Determines whether the given argument is a String.
     *
     * @inner
     *
     * @param arg argument
     *
     * @returns {Boolean} whether it is a String
     */
    Ratchet.isString = function( arg ) {
        return (typeof arg == "string");
    };

    /**
     * Determines whether the given argument is a Function.
     *
     * @inner
     *
     * @param arg argument
     *
     * @returns {Boolean} whether it is a Function
     */
    Ratchet.isFunction = function(arg) {
        return Object.prototype.toString.call(arg) === "[object Function]";
    };

    /**
     * Determines whether a bit of text starts with a given prefix.
     *
     * @inner
     *
     * @param {String} text A bit of text.
     * @param {String} prefix The prefix.
     *
     * @returns {Boolean} whether the text starts with the prefix.
     */
    Ratchet.startsWith = function(text, prefix) {
        return text.substr(0, prefix.length) === prefix;
    };

    /**
     * Copies the members of the source object into the target object.
     * This includes both properties and functions from the source object.
     *
     * @inner
     *
     * @param {Object} target Target object.
     * @param {Object} source Source object.
     */
    Ratchet.copyInto = function(target, source) {
        for (var i in source) {
            if (source.hasOwnProperty(i) && !this.isFunction(this[i])) {
                target[i] = source[i];
            }
        }
    };

    Ratchet.isArray = function(obj)
    {
        return obj.push && obj.slice;
    };

    Ratchet.isUndefined = function(obj)
    {
        return (typeof obj == "undefined");
    };

    Ratchet.isEmpty = function(obj)
    {
        return this.isUndefined(obj) || obj == null;
    };

    Ratchet.generateId = function()
    {
        Ratchet.uniqueIdCounter++;
        return "ratchet-" + Ratchet.uniqueIdCounter;
    };

    Ratchet.isNode = function(o)
    {
        return (
                typeof Node === "object" ? o instanceof Node :
                        typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string");
    };

    Ratchet.isElement = function(o)
    {
        return (
                typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
                        typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string");
    };

    Ratchet.debug = function(str)
    {
        if (!this.isUndefined(console))
        {
            console.log(str);
        }
    };

    Ratchet.error = function(str)
    {
        if (!this.isUndefined(console))
        {
            console.error(str);
        }
    };

    Ratchet.copyAttributes = function(sourceEl, targetEl)
    {
        for (var a = 0; a < $(sourceEl)[0].attributes.length; a++)
        {
            var key = $(sourceEl)[0].attributes[a].name;
            var value = $(sourceEl)[0].attributes[a].value;

            $(targetEl).attr(key, value);
        }
    };

    Ratchet.params = function()
    {
        var urlParams = {};

        if (window.location.href.indexOf('?') == -1) {
            return urlParams;
        }

        var params = window.location.href.split('?')[1].split("&"), length = params.length, current;

        if (params[ 0 ]) {
            for (var i = 0; i < length; i++) {
                current = params[ i ].split("=");
                current[ 0 ] = decodeURIComponent(current[ 0 ]);
                // allow just a key to turn on a flag, e.g., test.html?noglobals
                current[ 1 ] = current[ 1 ] ? decodeURIComponent(current[ 1 ]) : true;
                urlParams[ current[ 0 ] ] = current[ 1 ];
            }
        }

        return urlParams;
    };

    Ratchet.hashParam = function(paramName)
    {
        var searchString = window.location.href.substring(window.location.href.indexOf("#") + 1);
        var params = searchString.split("&");

        for (i = 0; i < params.length; i++)
        {
            val = params[i].split("=");

            if (val[0] == paramName)
            {
                return unescape(val[1]);
            }
        }

        return null;
    };


})(window);