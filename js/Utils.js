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

    Ratchet.isArray = function(thing)
    {
        return thing.push && thing.slice;
    };

    Ratchet.isUndefined = function(thing)
    {
        return (typeof thing == "undefined");
    };

    Ratchet.isEmpty = function(thing)
    {
        return this.isUndefined(thing) || thing == null;
    };

    Ratchet.isEmptyObject = function(thing)
    {
        var empty = true;

        for (var k in thing)
        {
            empty = false;
            break;
        }

        return empty;
    };

    Ratchet.isObject = function(thing)
    {
        return (typeof(thing) === "object") && (typeof(thing.length) === "undefined");
    };

    Ratchet.copyOf = function(thing)
    {
        var copy = thing;

        if (Ratchet.isArray(thing) || Ratchet.isObject(thing))
        {
            copy = JSON.parse(JSON.stringify(thing));
        }

        return copy;
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

    /*
    Ratchet.removeFromArray = function(array, value, all)
    {
        for (var i = 0; i < array.length; i++)
        {
            if (array[i] == value) {
                array.splice(i, 1);
                i--;

                if (!all) {
                    break;
                }
            }
        }

        return array;
    };
    */

    Ratchet.substituteTokens = function(original, tokens)
    {
        var text = original;

        for (var tokenId in tokens)
        {
            var tokenValue = tokens[tokenId];
            text = text.replace("{" + tokenId + "}", tokenValue);
        }

        return text;
    };

    Ratchet.merge = function(source, target)
    {
        var isArray = Ratchet.isArray;
        var isObject = Ratchet.isObject;
        var isUndefined = Ratchet.isUndefined;
        var copyOf = Ratchet.copyOf;

        var merge = function(source, target)
        {
            if (isArray(source))
            {
                if (isArray(target))
                {
                    // merge array elements
                    $.each(source, function(index) {
                        target.push(copyOf(source[index]));
                    });
                }
                else
                {
                    // something is already in the target that isn't an ARRAY
                    // skip
                }
            }
            else if (isObject(source))
            {
                if (isObject(target))
                {
                    // merge object properties
                    $.each(source, function(key) {

                        if (isUndefined(target[key])) {
                            target[key] = copyOf(source[key]);
                        } else {
                            target[key] = merge(source[key], target[key]);
                        }

                    });
                }
                else
                {
                    // something is already in the target that isn't an OBJECT
                    // skip
                }

            }
            else
            {
                // otherwise, it's a scalar, always overwrite
                target = copyOf(source);
            }

            return target;
        };

        merge(source, target)
    };

    /**
     * Parses an ISO8601 encoded date string to a JS date object.
     *
     * @param text
     * @returns javascript date (or null if cannot parse)
     */
    Ratchet.parseISO8601 = function(text)
    {
        var regex = /^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;

        var match = regex.exec(text);
        var result = null;

        if (match)
        {
            match.shift();
            if (match[1])
            {
                // decrement since JS date months are 0-based
                match[1]--;
            }
            if (match[6])
            {
                // JS date expects fractional seconds as milliseconds
                match[6] *= 1000;
            }

            result = new Date(match[0]||1970, match[1]||0, match[2]||1, match[3]||0, match[4]||0, match[5]||0, match[6]||0);

            var offset = 0;
            var zoneSign = match[7] && match[7].charAt(0);
            if (zoneSign != 'Z')
            {
                offset = ((match[8] || 0) * 60) + (Number(match[9]) || 0);
                if (zoneSign != '-')
                {
                    offset *= -1;
                }
            }
            if (zoneSign)
            {
                offset -= result.getTimezoneOffset();
            }
            if (offset)
            {
                result.setTime(result.getTime() + offset * 60000);
            }
        }

        return result;
    };

})(window);