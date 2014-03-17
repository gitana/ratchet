/*jshint -W014 */ // bad line breaking
/*jshint -W004 */ // duplicate variables
(function($)
{
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
        if (thing === true || thing === false || Ratchet.isUndefined(thing) || thing === null) {
            return false;
        }

        return thing.push && thing.slice;
    };

    Ratchet.isUndefined = function(thing)
    {
        return (typeof thing == "undefined");
    };

    Ratchet.isEmpty = function(thing)
    {
        return this.isUndefined(thing) || (thing === null);
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
        if (thing === true || thing === false || Ratchet.isUndefined(thing) || thing === null) {
            return false;
        }

        return (typeof(thing) === "object") && (typeof(thing.length) === "undefined");
    };

    Ratchet.copyOf = function(thing)
    {
        var copy = thing;

        if (Ratchet.isArray(thing))
        {
            copy = [];

            for (var i = 0; i < thing.length; i++)
            {
                copy.push(Ratchet.copyOf(thing[i]));
            }
        }
        else if (Ratchet.isObject(thing))
        {
            if (thing instanceof Date)
            {
                // date
                return new Date(thing.getTime());
            }
            else if (thing instanceof RegExp)
            {
                // regular expression
                return new RegExp(thing);
            }
            else if (thing.nodeType && "cloneNode" in thing)
            {
                // DOM node
                copy = thing.cloneNode(true);
            }
            else if ($.isPlainObject(thing))
            {
                copy = {};

                for (var k in thing)
                {
                    if (thing.hasOwnProperty(k))
                    {
                        copy[k] = Ratchet.copyOf(thing[k]);
                    }
                }
            }
            else
            {
                // otherwise, it's some other kind of object so we just do a referential copy
                // in other words, not a copy
            }
        }

        return copy;
    };

    Ratchet.generateId = function()
    {
        return "ratchet-" + Ratchet.uniqueCount();
    };

    Ratchet.generateGadgetId = function()
    {
        return "gadget-" + Ratchet.uniqueCount();
    };

    Ratchet.generateListenerId = function()
    {
        return "l-" + Ratchet.uniqueCount();
    };

    Ratchet.generateEventHandlerId = function()
    {
        return "ev-" + Ratchet.uniqueCount();
    };

    Ratchet.uniqueCount = function()
    {
        var x = 0;

        return function()
        {
            return x++;
        };
    }();

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

    Ratchet.urlEncode = function(text)
    {
        return encodeURIComponent(text);
    };

    Ratchet.urlDecode = function(text)
    {
        return decodeURIComponent(text);
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

    Ratchet.merge = function(source, target, fns)
    {
        if (!fns) {
            fns = {};
        }

        // by default, for arrays, we compare on key "_key"
        if (!fns.existsInArray) {
            fns.existsInArray = function(array, object) {

                for (var i = 0; i < array.length; i++) {

                    if (Ratchet.isString(object)) {

                        if (Ratchet.isString(array[i]) && array[i] == object)
                        {
                            return true;
                        }

                    } else if (Ratchet.isObject(object)) {

                        if (object._key && array[i]._key) {
                            if (array[i]._key == object._key) {
                                return true;
                            }
                        }

                    }
                }

                return false;
            };
        }

        var isArray = Ratchet.isArray;
        var isObject = Ratchet.isObject;
        var isUndefined = Ratchet.isUndefined;
        var copyOf = Ratchet.copyOf;

        var merge = function(source, target)
        {
            if (Ratchet.isUndefined(source))
            {
                // do nothing
            }
            else if (isArray(source))
            {
                if (isArray(target))
                {
                    // merge array elements
                    $.each(source, function(index) {

                        var existsInArray = fns.existsInArray(target, source[index]);
                        if (!existsInArray)
                        {
                            var theCopy = copyOf(source[index]);
                            target.push(theCopy);
                        }
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

        merge(source, target);
    };

    /**
     * Finds if an string ends with a given suffix.
     *
     * @param {String} text The string being evaluated.
     * @param {String} suffix Suffix.
     * @returns {Boolean} True if the string ends with the given suffix, false otherwise.
     */
    Ratchet.endsWith = function(text, suffix) {
        return text.indexOf(suffix, text.length - suffix.length) !== -1;
    };

    /**
     * Combines one or more path elements into a combined path.
     *
     * @return {String}
     */
    Ratchet.paths = function()
    {
        var args = Ratchet.makeArray(arguments);

        var result = "";

        for (var i = 0; i < args.length; i++)
        {
            result += "/" + args[i];
        }

        result = result.replace("//", "/");
        result = result.replace("//", "/");

        return result;
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

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // OBSERVABLES HELPER FUNCTIONS
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Subscribes a function handler to an observable.
     *
     * @param [String] scope optional scope
     * @param {String} id the variable id
     * @param {Function} callbackFunction the callback function
     *
     * @return descriptor
     */
    Ratchet.subscribe = function()
    {
        var args = Ratchet.makeArray(arguments);

        var scope = null;
        var id = null;
        var listener = null;

        if (args.length == 2)
        {
            scope = "global";
            id = args.shift();
            listener = args.shift();
        }
        else
        {
            scope = args.shift();
            id = args.shift();
            listener = args.shift();
        }

        if (!id)
        {
            Ratchet.logError("Missing observable subscribe id: " + id);
            return null;
        }

        // function identifier
        var listenerId = listener._lfid;
        if (!listenerId) {
            listenerId = Ratchet.generateListenerId();
            listener._lfid = listenerId;
        }

        // wrap function into a closure
        var func = function(that) {
            return function() {
                return listener.apply(that, arguments);
            };
        }(this);
        func._lfid = listener._lfid;

        var observables = Ratchet.ScopedObservables.get(scope);
        var observable = observables.observable(id);

        // tell the observable to subscribe
        observable.subscribe(listenerId, func);

        return {
            "scope": scope,
            "id": id,
            "listenerId": listenerId
        };
    };

    /**
     * Unsubscribes a function handler from an observable.
     *
     * @param [String] scope optional scope
     * @param {String} id the variable id
     * @param {String|Function} listener either the function or listener id
     * @return descriptor
     */
    Ratchet.unsubscribe = function()
    {
        var args = Ratchet.makeArray(arguments);

        var scope = null;
        var id = null;
        var listenerOrId = null;

        if (args.length == 2)
        {
            scope = "global";
            id = args.shift();
            listenerOrId = args.shift();
        }
        else if (args.length == 3)
        {
            scope = args.shift();
            id = args.shift();
            listenerOrId = args.shift();
        }

        var listenerId = listenerOrId;
        if (Ratchet.isFunction(listenerId))
        {
            listenerId = listenerId._lfid;
        }

        var observables = Ratchet.ScopedObservables.get(scope);
        var observable = observables.observable(id);

        // tell the observable to unsubscribe
        observable.unsubscribe(listenerId);

        return {
            "scope": scope,
            "id": id,
            "listenerId": listenerId
        };
    };

    /**
     * Gets or sets an observable in the given scope.
     *
     * @param [String] scope optional scope
     * @param {String} id the variable id
     */
    Ratchet.observable = function()
    {
        var scope;
        var id;

        var args = Ratchet.makeArray(arguments);
        if (args.length == 1)
        {
            scope = "global";
            id = args.shift();
        }
        else if (args.length == 2)
        {
            scope = args.shift();
            id = args.shift();
        }

        var observable = null;
        if (id == null || typeof(id) == "undefined")
        {
            Ratchet.logError("Missing observable id: " + JSON.stringify(args));
        }
        else
        {
            var observables = Ratchet.ScopedObservables.get(scope);
            observable = observables.observable(id);
        }

        return observable;
    };

    Ratchet.clearObservable = function()
    {
        var scope;
        var id;

        var args = Ratchet.makeArray(arguments);
        if (args.length == 1)
        {
            scope = "global";
            id = args.shift();
        }
        else if (args.length == 2)
        {
            scope = args.shift();
            id = args.shift();
        }

        var observables = Ratchet.ScopedObservables.get(scope);
        var observable = observables.observable(id);

        observable.clear();
    };

    /**
     * Declares and gets a dependent observable in a given scope
     *
     * @param scope
     * @param id
     * @param func
     */
    Ratchet.dependentObservable = function()
    {
        var scope = null;
        var id = null;
        var func = null;

        var args = Ratchet.makeArray(arguments);
        if (args.length == 2)
        {
            scope = "global";
            id = args.shift();
            func = args.shift();
        }
        else if (args.length == 3)
        {
            scope = args.shift();
            id = args.shift();
            func = args.shift();
        }
        else
        {
            Ratchet.error("Wrong number of arguments");
            return;
        }

        var observables = Ratchet.ScopedObservables.get(scope);

        return observables.dependentObservable(id, func);
    };

    Ratchet.firstValueInObject = function(object)
    {
        var value = null;

        var firstKey = Ratchet.firstKeyInObject(object);
        if (firstKey) {
            value = object[firstKey];
        }

        return value;
    };

    Ratchet.firstKeyInObject = function(object)
    {
        if (object) {
            for (var k in object) {
                if (object.propertyIsEnumerable(k)) {
                    return k;
                }
            }
        }
        return null;
    };

    Ratchet.clearArray = function(array)
    {
        return array.splice(0, array.length);
    };

    Ratchet.clearObject = function(object)
    {
        var keys = [];
        for (var key in object) {
            keys.push(key);
        }
        for (var i = 0; i < keys.length; i++)
        {
            delete object[keys[i]];
        }
    };

    Ratchet.clear = function(thing)
    {
        if (Ratchet.isObject(thing)) {
            Ratchet.clearObject(thing);

        } else if (Ratchet.isArray(thing)) {
            Ratchet.clearArray(thing);
        }
    };

    /**
     * Converts a one or more arguments into a linearized format.
     *
     * For example:
     *
     *   Ratchet.toLinearForm("a", {
     *       "b": {
     *            "c": "x1",
     *            "d": [1,2]
     *       }
     *   };
     *
     * Returns:
     *
     *   a&b.c=x1&b.d.0=1&b.d.1=2
     *
     * @return {String}
     */
    Ratchet.toLinearForm = function()
    {
        var result = "";

        var textualize = function(prefix, mapOrArray)
        {
            var str = null;

            if (mapOrArray)
            {
                str = "";

                // convert scalar map elements to a linear form
                var array = [];
                for (var k in mapOrArray)
                {
                    var value = mapOrArray[k];

                    var key = k;
                    if (prefix) {
                        key = prefix + "." + key;
                    }

                    if (Ratchet.isObject(value) || Ratchet.isArray(value))
                    {
                        array.push(textualize(key, value));
                    }
                    else
                    {
                        array.push("" + key + "=" + value);
                    }
                }

                // now sort the array
                array.sort();

                // combine into a string
                for (var j = 0; j < array.length; j++)
                {
                    str += array[j];
                    if (j + 1 < array.length) {
                        str += "&";
                    }
                }
            }

            return str;
        };

        for (var i = 0; i < arguments.length; i++)
        {
            var value = arguments[i];
            if (value)
            {
                if (Ratchet.isObject(value) || Ratchet.isArray(value))
                {
                    value = textualize(null, value);
                }

                result += value;

                if (i + 1 < arguments.length) {
                    result += "&";
                }
            }
        }

        return result;
    };

    Ratchet.firstObjectKey = function(map)
    {
        var key = null;

        if (map)
        {
            for (var k in map)
            {
                if (map.propertyIsEnumerable(k))
                {
                    key = k;
                    break;
                }
            }
        }

        return key;
    };

    /**
     * Converts a wildcard pattern to a regular expression pattern.
     * Incorporated from jPad (http://jpaq.org/) MIT license.
     *
     * @param pat
     * @param opts
     * @return {RegExp}
     */
    Ratchet.wildcardToRegExp = function(pat, opts) {
        if (!opts) {
            opts = "lg";
        }

        var oOpt = opts && opts.indexOf("o") > -1;
        var i, m, p = "", sAdd = (opts && opts.indexOf("l") > -1 ? "" : "?");
        var re = new RegExp("~.|\\[!|" + (oOpt ? "{\\d+,?\\d*\\}|[" : "[")
            + (opts && opts.indexOf("p") > -1 ? "" : "\\(\\)")
            + "\\{\\}\\\\\\.\\*\\+\\?\\:\\|\\^\\$%_#<>]");
        while((i = pat.search(re)) > -1 && i < pat.length) {
            p += pat.substring(0, i);
            if((m = pat.match(re)[0]) == "[!")
                p += "[^";
            else if(m.charAt(0) == "~")
                p += "\\" + m.charAt(1);
            else if(m == "*" || m == "%")
                p += ".*" + sAdd;
            else if(m == "?" || m == "_")
                p += ".";
            else if(m == "#")
                p += "\\d";
            else if(oOpt && m.charAt(0) == "{")
                p += m + sAdd;
            else if(m == "<")
                p += "\\b(?=\\w)";
            else if(m == ">")
                p += "(?:\\b$|(?=\\W)\\b)";
            else
                p += "\\" + m;
            pat = pat.substring(i + m.length);
        }
        p += pat;
        if(opts) {
            if(/[ab]/.test(opts))
                p = "^" + p;
            if(/[ae]/.test(opts))
                p += "$";
        }
        return new RegExp(p, opts ? opts.replace(/[^gim]/g, "") : "");
    };

    Ratchet.padLeft = function(nr, n, str)
    {
        return Array(n-String(nr).length+1).join(str||'0')+nr;
    };

    Ratchet.each = function(objectOrArray, f)
    {
        for (var k in objectOrArray) {
            f(k, objectOrArray[k]);
        }
    };

    /**
     * Strips any excess whitespace characters from the given text.
     * Returns the trimmed string.
     *
     * @param str
     *
     * @return trimmed string
     */
    Ratchet.trim = function(text)
    {
        var trimmed = text;

        if (trimmed && Ratchet.isString(trimmed))
        {
            trimmed = trimmed.replace(/^\s+|\s+$/g, '');
        }

        return trimmed;
    };

    Ratchet.replaceAll = function(text, find, replace)
    {
        return text.replace(new RegExp(find, 'g'), replace);
    };

    /**
     * Resolves dot-notation references into the given object.
     *
     * @param obj
     * @param string
     * @return {*} null if not found
     */
    Ratchet.resolveDotNotation = function(obj, string)
    {
        var parts = string.split('.');
        var newObj = obj[parts[0]];
        if (parts[1])
        {
            if (!newObj)
            {
                return null;
            }

            parts.splice(0,1);

            var newString = parts.join('.');
            return Ratchet.resolveDotNotation(newObj,newString);
        }

        return newObj;
    };

    Ratchet.writeDotNotation = function(obj, string, value)
    {
        var n = obj;

        var parts = string.split(".");
        if (parts.length == 0)
        {
        }
        else if (parts.length == 1)
        {
            obj[string] = value;
        }
        else if (parts.length > 1)
        {
            for (var i = 0; i < parts.length - 1; i++)
            {
                if (!n[parts[i]])
                {
                    n[parts[i]] = {};
                }
                n = n[parts[i]];
            }
            n[parts[parts.length-1]] = value;
        }
    };

    Ratchet.removeDotNotation = function(obj, string)
    {
        var n = obj;

        var parts = string.split(".");
        if (parts.length == 0)
        {
        }
        else if (parts.length == 1)
        {
            delete obj[string];
        }
        else if (parts.length > 1)
        {
            for (var i = 0; i < parts.length - 1; i++)
            {
                if (!n[parts[i]])
                {
                    break;
                }

                n = n[parts[i]];
            }

            if (i == parts.length - 1)
            {
                delete n[parts[parts.length-1]];
            }
        }
    };

    /**
     * Counts the number of properties in an object.
     *
     * @param obj
     * @returns {number}
     */
    Ratchet.countProperties = function(obj)
    {
        var count = 0;

        if (obj)
        {
            for (var k in obj)
            {
                if (obj.hasOwnProperty(k) && typeof(obj[k]) !== "function")
                {
                    count++;
                }
            }
        }

        return count;
    };

    Ratchet.substituteVariables = function(obj, model, tokens, observableHolder)
    {
        var replacementFunction = function(token)
        {
            var replacement = null;
            if (token.indexOf(".") == -1)
            {
                // not dot-delimited

                replacement = model[token];
                if (!replacement && observableHolder)
                {
                    replacement = observableHolder.observable(token).get();
                }
                if (!replacement && tokens)
                {
                    replacement = tokens[token];
                }
            }
            else
            {
                // otherwise, it is dot-delimited...
                var parts = token.split(".");
                var first = parts.shift();

                var initial = model[first];
                if (!initial)
                {
                    initial = observableHolder.observable(first).get();
                }
                if (!initial && tokens)
                {
                    initial = tokens[first];
                }
                if (initial)
                {
                    var remainderDotNotation = parts.join(".");

                    replacement = Ratchet.resolveDotNotation(initial, remainderDotNotation);
                }
            }

            return replacement;
        };

        Ratchet.substitute(obj, replacementFunction);
    };

    Ratchet.substitute = function(obj, replacementFunction)
    {
        // walk all variables in the model and see if we can perform ${} substitutions
        // substitution sources include el.tokens and observables

        var subst = function(objOrArray, level)
        {
            if (!objOrArray || level > 3)
            {
                return;
            }

            if (Ratchet.isArray(objOrArray))
            {
                for (var i = 0; i < objOrArray.length; i++)
                {
                    if (Ratchet.isObject(objOrArray[i]) || Ratchet.isArray(objOrArray[i]))
                    {
                        subst(objOrArray[i], level + 1);
                    }
                }
            }
            else if (Ratchet.isObject(objOrArray))
            {
                for (var k in objOrArray)
                {
                    if (objOrArray.hasOwnProperty(k))
                    {
                        if (Ratchet.isString(objOrArray[k]))
                        {
                            var text = objOrArray[k];

                            var CARS = ["${", "{"];

                            // substitute any tokens
                            var x = -1;
                            var b = 0;
                            do
                            {
                                var car = null;
                                for (var a = 0; a < CARS.length; a++)
                                {
                                    car = CARS[a];

                                    x = text.indexOf(car, b);
                                    if (x > -1)
                                    {
                                        break;
                                    }
                                }

                                if (x > -1)
                                {
                                    var y = text.indexOf("}", x);
                                    if (y > -1)
                                    {
                                        var token = text.substring(x + car.length, y);

                                        var replacement = replacementFunction(token);
                                        if (replacement)
                                        {
                                            text = text.substring(0, x) + replacement + text.substring(y+1);
                                            objOrArray[k] = text;
                                        }

                                        b = y + 1;
                                    }
                                }
                            }
                            while(x > -1);
                        }
                        else if (Ratchet.isObject(objOrArray[k]) || Ratchet.isArray(objOrArray[k]))
                        {
                            subst(objOrArray[k], level + 1);
                        }
                    }
                }
            }
        };

        subst(obj, 0);
    };

    /**
     * Writes a cookie.
     *
     * @param {String} name
     * @param {String} value
     * @param [String] path optional path (assumed "/" if not provided)
     * @param [Number] days optional # of days to store cookie (assumes session cookie if null)
     * @param [String] domain optional domain (otherwise assumes wildcard base domain)
     */
    Ratchet.writeCookie = function(name, value, path, days, domain)
    {
        if (typeof(document) !== "undefined")
        {
            function createCookie(name, value, path, days, host)
            {
                // path
                if (!path)
                {
                    path = "/";
                }
                var pathString = "; path=" + path;

                // expiration
                var expirationString = "";
                if (days)
                {
                    var date = new Date();
                    date.setTime(date.getTime()+(days*24*60*60*1000));
                    expirationString = "; expires="+date.toGMTString();
                }

                // domain
                var domainString = "";
                if (host)
                {
                    domainString = "; domain=" + host;
                }

                document.cookie = name + "=" + value + expirationString + pathString + domainString;
            }

            createCookie(name, value, path, days, domain);
        }
    };

    /**
     * Deletes a cookie.
     *
     * @param name
     * @param path
     */
    Ratchet.deleteCookie = function(name, path)
    {
        if (typeof(document) !== "undefined")
        {
            // uses the browser's assumed domain
            Ratchet.writeCookie(name, "", path, -1);

            // also delete for our specific domain
            // this is because some browsers seem to assume a different root domain than cookie may have come back
            // from if it was written through, say, an Apache Proxy (using cookie domain rewriting)
            Ratchet.writeCookie(name, "", path, -1, window.location.host)
        }
    };

    Ratchet.readCookie = function(name)
    {
        function _readCookie(name)
        {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++)
            {
                var c = ca[i];
                while (c.charAt(0)==' ')
                {
                    c = c.substring(1,c.length);
                }

                if (c.indexOf(nameEQ) == 0)
                {
                    return c.substring(nameEQ.length,c.length);
                }
            }
            return null;
        }

        var value = null;

        if (typeof(document) !== "undefined")
        {
            value = _readCookie(name);
        }

        return value;
    };



    // browser detection
    Ratchet.Browser = function($) {

        var jQversion = jQuery.fn.jquery.split(".");
        if(jQversion[1]<8)
            return;

        var browser = {};
        //browser.mozilla = false;
        //browser.webkit = false;
        browser.safari = false;
        browser.chrome = false;
        browser.opera = false;
        browser.ie = false;
        browser.firefox = false;

        var nAgt = navigator.userAgent;
        browser.name  = navigator.appName;
        browser.fullVersion  = ''+parseFloat(navigator.appVersion);
        browser.majorVersion = parseInt(navigator.appVersion,10);
        var nameOffset,verOffset,ix;

        // In Opera, the true version is after "Opera" or after "Version"
        if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
            browser.opera = true;
            browser.name = "Opera";
            browser.fullVersion = nAgt.substring(verOffset+6);
            if ((verOffset=nAgt.indexOf("Version"))!=-1)
                browser.fullVersion = nAgt.substring(verOffset+8);
        }
        // In MSIE, the true version is after "MSIE" in userAgent
        else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
            browser.ie = true;
            browser.name = "Microsoft Internet Explorer";
            browser.fullVersion = nAgt.substring(verOffset+5);
        }
        // In Chrome, the true version is after "Chrome"
        else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
            //browser.webkit = true;
            browser.chrome = true;
            browser.name = "Chrome";
            browser.fullVersion = nAgt.substring(verOffset+7);
        }
        // In Safari, the true version is after "Safari" or after "Version"
        else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
            //browser.webkit = true;
            browser.safari = true;
            browser.name = "Safari";
            browser.fullVersion = nAgt.substring(verOffset+7);
            if ((verOffset=nAgt.indexOf("Version"))!=-1)
                browser.fullVersion = nAgt.substring(verOffset+8);
        }
        // In Firefox, the true version is after "Firefox"
        else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
            browser.firefox = true;
            browser.name = "Firefox";
            browser.fullVersion = nAgt.substring(verOffset+8);
        }
        // In most other browsers, "name/version" is at the end of userAgent
        else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) <
            (verOffset=nAgt.lastIndexOf('/')) )
        {
            browser.name = nAgt.substring(nameOffset,verOffset);
            browser.fullVersion = nAgt.substring(verOffset+1);
            if (browser.name.toLowerCase()==browser.name.toUpperCase()) {
                browser.name = navigator.appName;
            }
        }
        // trim the fullVersion string at semicolon/space if present
        if ((ix=browser.fullVersion.indexOf(";"))!=-1)
            browser.fullVersion=browser.fullVersion.substring(0,ix);
        if ((ix=browser.fullVersion.indexOf(" "))!=-1)
            browser.fullVersion=browser.fullVersion.substring(0,ix);

        browser.majorVersion = parseInt(''+browser.fullVersion,10);
        if (isNaN(browser.majorVersion)) {
            browser.fullVersion  = ''+parseFloat(navigator.appVersion);
            browser.majorVersion = parseInt(navigator.appVersion,10);
        }
        browser.version = browser.majorVersion;

        return browser;
    }($);










    Ratchet.series = function(funcs, callback)
    {
        async.series(funcs, function() {
            callback();
        });
    };

    Ratchet.parallel = function(funcs, callback)
    {
        async.parallel(funcs, function() {
            callback();
        });
    };

    Ratchet.nextTick = function(f)
    {
        async.nextTick(function() {
            f();
        });
    };




    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // ASYNC
    //
    // Here we provide a reduced version of the wonderful async library.  This is entirely inline and
    // will have no bearing on any external dependencies on async.
    //
    // https://github.com/caolan/async
    // Copyright (c) 2010 Caolan McMahon
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    /*global setImmediate: false, setTimeout: false, console: false */
    (function () {

        var async = {};

        // global on the server, window in the browser
        var root, previous_async;

        root = this;
        if (root != null) {
            previous_async = root.async;
        }

        async.noConflict = function () {
            root.async = previous_async;
            return async;
        };

        function only_once(fn) {
            var called = false;
            return function() {
                if (called) throw new Error("Callback was already called.");
                called = true;
                fn.apply(root, arguments);
            }
        }

        //// cross-browser compatiblity functions ////

        var _each = function (arr, iterator) {
            if (arr.forEach) {
                return arr.forEach(iterator);
            }
            for (var i = 0; i < arr.length; i += 1) {
                iterator(arr[i], i, arr);
            }
        };

        var _map = function (arr, iterator) {
            if (arr.map) {
                return arr.map(iterator);
            }
            var results = [];
            _each(arr, function (x, i, a) {
                results.push(iterator(x, i, a));
            });
            return results;
        };

        var _reduce = function (arr, iterator, memo) {
            if (arr.reduce) {
                return arr.reduce(iterator, memo);
            }
            _each(arr, function (x, i, a) {
                memo = iterator(memo, x, i, a);
            });
            return memo;
        };

        var _keys = function (obj) {
            if (Object.keys) {
                return Object.keys(obj);
            }
            var keys = [];
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    keys.push(k);
                }
            }
            return keys;
        };

        //// exported async module functions ////

        //// nextTick implementation with browser-compatible fallback ////
        if (typeof process === 'undefined' || !(process.nextTick)) {
            if (typeof setImmediate === 'function') {
                async.nextTick = function (fn) {
                    // not a direct alias for IE10 compatibility
                    setImmediate(fn);
                };
                async.setImmediate = async.nextTick;
            }
            else {
                async.nextTick = function (fn) {
                    setTimeout(fn, 0);
                };
                async.setImmediate = async.nextTick;
            }
        }
        else {
            async.nextTick = process.nextTick;
            if (typeof setImmediate !== 'undefined') {
                async.setImmediate = function (fn) {
                    // not a direct alias for IE10 compatibility
                    setImmediate(fn);
                };
            }
            else {
                async.setImmediate = async.nextTick;
            }
        }

        async.each = function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length) {
                return callback();
            }
            var completed = 0;
            _each(arr, function (x) {
                iterator(x, only_once(function (err) {
                    if (err) {
                        callback(err);
                        callback = function () {};
                    }
                    else {
                        completed += 1;
                        if (completed >= arr.length) {
                            callback(null);
                        }
                    }
                }));
            });
        };
        async.forEach = async.each;

        async.eachSeries = function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length) {
                return callback();
            }
            var completed = 0;
            var iterate = function () {
                iterator(arr[completed], function (err) {
                    if (err) {
                        callback(err);
                        callback = function () {};
                    }
                    else {
                        completed += 1;
                        if (completed >= arr.length) {
                            callback(null);
                        }
                        else {
                            iterate();
                        }
                    }
                });
            };
            iterate();
        };
        async.forEachSeries = async.eachSeries;

        async.eachLimit = function (arr, limit, iterator, callback) {
            var fn = _eachLimit(limit);
            fn.apply(null, [arr, iterator, callback]);
        };
        async.forEachLimit = async.eachLimit;

        var _eachLimit = function (limit) {

            return function (arr, iterator, callback) {
                callback = callback || function () {};
                if (!arr.length || limit <= 0) {
                    return callback();
                }
                var completed = 0;
                var started = 0;
                var running = 0;

                (function replenish () {
                    if (completed >= arr.length) {
                        return callback();
                    }

                    while (running < limit && started < arr.length) {
                        started += 1;
                        running += 1;
                        iterator(arr[started - 1], function (err) {
                            if (err) {
                                callback(err);
                                callback = function () {};
                            }
                            else {
                                completed += 1;
                                running -= 1;
                                if (completed >= arr.length) {
                                    callback();
                                }
                                else {
                                    replenish();
                                }
                            }
                        });
                    }
                })();
            };
        };


        var doParallel = function (fn) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.each].concat(args));
            };
        };
        var doParallelLimit = function(limit, fn) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [_eachLimit(limit)].concat(args));
            };
        };
        var doSeries = function (fn) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.eachSeries].concat(args));
            };
        };


        var _asyncMap = function (eachfn, arr, iterator, callback) {
            var results = [];
            arr = _map(arr, function (x, i) {
                return {index: i, value: x};
            });
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err, v) {
                    results[x.index] = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        };
        async.map = doParallel(_asyncMap);
        async.mapSeries = doSeries(_asyncMap);
        async.mapLimit = function (arr, limit, iterator, callback) {
            return _mapLimit(limit)(arr, iterator, callback);
        };

        var _mapLimit = function(limit) {
            return doParallelLimit(limit, _asyncMap);
        };

        // reduce only has a series version, as doing reduce in parallel won't
        // work in many situations.
        async.reduce = function (arr, memo, iterator, callback) {
            async.eachSeries(arr, function (x, callback) {
                iterator(memo, x, function (err, v) {
                    memo = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, memo);
            });
        };
        // inject alias
        async.inject = async.reduce;
        // foldl alias
        async.foldl = async.reduce;

        async.reduceRight = function (arr, memo, iterator, callback) {
            var reversed = _map(arr, function (x) {
                return x;
            }).reverse();
            async.reduce(reversed, memo, iterator, callback);
        };
        // foldr alias
        async.foldr = async.reduceRight;

        var _filter = function (eachfn, arr, iterator, callback) {
            var results = [];
            arr = _map(arr, function (x, i) {
                return {index: i, value: x};
            });
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (v) {
                    if (v) {
                        results.push(x);
                    }
                    callback();
                });
            }, function (err) {
                callback(_map(results.sort(function (a, b) {
                    return a.index - b.index;
                }), function (x) {
                    return x.value;
                }));
            });
        };
        async.filter = doParallel(_filter);
        async.filterSeries = doSeries(_filter);
        // select alias
        async.select = async.filter;
        async.selectSeries = async.filterSeries;

        var _reject = function (eachfn, arr, iterator, callback) {
            var results = [];
            arr = _map(arr, function (x, i) {
                return {index: i, value: x};
            });
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (v) {
                    if (!v) {
                        results.push(x);
                    }
                    callback();
                });
            }, function (err) {
                callback(_map(results.sort(function (a, b) {
                    return a.index - b.index;
                }), function (x) {
                    return x.value;
                }));
            });
        };
        async.reject = doParallel(_reject);
        async.rejectSeries = doSeries(_reject);

        var _detect = function (eachfn, arr, iterator, main_callback) {
            eachfn(arr, function (x, callback) {
                iterator(x, function (result) {
                    if (result) {
                        main_callback(x);
                        main_callback = function () {};
                    }
                    else {
                        callback();
                    }
                });
            }, function (err) {
                main_callback();
            });
        };
        async.detect = doParallel(_detect);
        async.detectSeries = doSeries(_detect);

        async.some = function (arr, iterator, main_callback) {
            async.each(arr, function (x, callback) {
                iterator(x, function (v) {
                    if (v) {
                        main_callback(true);
                        main_callback = function () {};
                    }
                    callback();
                });
            }, function (err) {
                main_callback(false);
            });
        };
        // any alias
        async.any = async.some;

        async.every = function (arr, iterator, main_callback) {
            async.each(arr, function (x, callback) {
                iterator(x, function (v) {
                    if (!v) {
                        main_callback(false);
                        main_callback = function () {};
                    }
                    callback();
                });
            }, function (err) {
                main_callback(true);
            });
        };
        // all alias
        async.all = async.every;

        async.sortBy = function (arr, iterator, callback) {
            async.map(arr, function (x, callback) {
                iterator(x, function (err, criteria) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, {value: x, criteria: criteria});
                    }
                });
            }, function (err, results) {
                if (err) {
                    return callback(err);
                }
                else {
                    var fn = function (left, right) {
                        var a = left.criteria, b = right.criteria;
                        return a < b ? -1 : a > b ? 1 : 0;
                    };
                    callback(null, _map(results.sort(fn), function (x) {
                        return x.value;
                    }));
                }
            });
        };

        async.auto = function (tasks, callback) {
            callback = callback || function () {};
            var keys = _keys(tasks);
            if (!keys.length) {
                return callback(null);
            }

            var results = {};

            var listeners = [];
            var addListener = function (fn) {
                listeners.unshift(fn);
            };
            var removeListener = function (fn) {
                for (var i = 0; i < listeners.length; i += 1) {
                    if (listeners[i] === fn) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            };
            var taskComplete = function () {
                _each(listeners.slice(0), function (fn) {
                    fn();
                });
            };

            addListener(function () {
                if (_keys(results).length === keys.length) {
                    callback(null, results);
                    callback = function () {};
                }
            });

            _each(keys, function (k) {
                var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
                var taskCallback = function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    if (err) {
                        var safeResults = {};
                        _each(_keys(results), function(rkey) {
                            safeResults[rkey] = results[rkey];
                        });
                        safeResults[k] = args;
                        callback(err, safeResults);
                        // stop subsequent errors hitting callback multiple times
                        callback = function () {};
                    }
                    else {
                        results[k] = args;
                        async.setImmediate(taskComplete);
                    }
                };
                var requires = task.slice(0, Math.abs(task.length - 1)) || [];
                var ready = function () {
                    return _reduce(requires, function (a, x) {
                        return (a && results.hasOwnProperty(x));
                    }, true) && !results.hasOwnProperty(k);
                };
                if (ready()) {
                    task[task.length - 1](taskCallback, results);
                }
                else {
                    var listener = function () {
                        if (ready()) {
                            removeListener(listener);
                            task[task.length - 1](taskCallback, results);
                        }
                    };
                    addListener(listener);
                }
            });
        };

        async.waterfall = function (tasks, callback) {
            callback = callback || function () {};
            if (tasks.constructor !== Array) {
                var err = new Error('First argument to waterfall must be an array of functions');
                return callback(err);
            }
            if (!tasks.length) {
                return callback();
            }
            var wrapIterator = function (iterator) {
                return function (err) {
                    if (err) {
                        callback.apply(null, arguments);
                        callback = function () {};
                    }
                    else {
                        var args = Array.prototype.slice.call(arguments, 1);
                        var next = iterator.next();
                        if (next) {
                            args.push(wrapIterator(next));
                        }
                        else {
                            args.push(callback);
                        }
                        async.setImmediate(function () {
                            iterator.apply(null, args);
                        });
                    }
                };
            };
            wrapIterator(async.iterator(tasks))();
        };

        var _parallel = function(eachfn, tasks, callback) {
            callback = callback || function () {};
            if (tasks.constructor === Array) {
                eachfn.map(tasks, function (fn, callback) {
                    if (fn) {
                        fn(function (err) {
                            var args = Array.prototype.slice.call(arguments, 1);
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            callback.call(null, err, args);
                        });
                    }
                }, callback);
            }
            else {
                var results = {};
                eachfn.each(_keys(tasks), function (k, callback) {
                    tasks[k](function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        results[k] = args;
                        callback(err);
                    });
                }, function (err) {
                    callback(err, results);
                });
            }
        };

        async.parallel = function (tasks, callback) {
            _parallel({ map: async.map, each: async.each }, tasks, callback);
        };

        async.parallelLimit = function(tasks, limit, callback) {
            _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
        };

        async.series = function (tasks, callback) {
            callback = callback || function () {};
            if (tasks.constructor === Array) {
                async.mapSeries(tasks, function (fn, callback) {
                    if (fn) {
                        fn(function (err) {
                            var args = Array.prototype.slice.call(arguments, 1);
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            callback.call(null, err, args);
                        });
                    }
                }, callback);
            }
            else {
                var results = {};
                async.eachSeries(_keys(tasks), function (k, callback) {
                    tasks[k](function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        results[k] = args;
                        callback(err);
                    });
                }, function (err) {
                    callback(err, results);
                });
            }
        };

        async.iterator = function (tasks) {
            var makeCallback = function (index) {
                var fn = function () {
                    if (tasks.length) {
                        tasks[index].apply(null, arguments);
                    }
                    return fn.next();
                };
                fn.next = function () {
                    return (index < tasks.length - 1) ? makeCallback(index + 1): null;
                };
                return fn;
            };
            return makeCallback(0);
        };

        async.apply = function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            return function () {
                return fn.apply(
                    null, args.concat(Array.prototype.slice.call(arguments))
                );
            };
        };

        var _concat = function (eachfn, arr, fn, callback) {
            var r = [];
            eachfn(arr, function (x, cb) {
                fn(x, function (err, y) {
                    r = r.concat(y || []);
                    cb(err);
                });
            }, function (err) {
                callback(err, r);
            });
        };
        async.concat = doParallel(_concat);
        async.concatSeries = doSeries(_concat);

        async.whilst = function (test, iterator, callback) {
            if (test()) {
                iterator(function (err) {
                    if (err) {
                        return callback(err);
                    }
                    async.whilst(test, iterator, callback);
                });
            }
            else {
                callback();
            }
        };

        async.doWhilst = function (iterator, test, callback) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                if (test()) {
                    async.doWhilst(iterator, test, callback);
                }
                else {
                    callback();
                }
            });
        };

        async.until = function (test, iterator, callback) {
            if (!test()) {
                iterator(function (err) {
                    if (err) {
                        return callback(err);
                    }
                    async.until(test, iterator, callback);
                });
            }
            else {
                callback();
            }
        };

        async.doUntil = function (iterator, test, callback) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                if (!test()) {
                    async.doUntil(iterator, test, callback);
                }
                else {
                    callback();
                }
            });
        };

        async.queue = function (worker, concurrency) {
            if (concurrency === undefined) {
                concurrency = 1;
            }
            function _insert(q, data, pos, callback) {
                if(data.constructor !== Array) {
                    data = [data];
                }
                _each(data, function(task) {
                    var item = {
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    };

                    if (pos) {
                        q.tasks.unshift(item);
                    } else {
                        q.tasks.push(item);
                    }

                    if (q.saturated && q.tasks.length === concurrency) {
                        q.saturated();
                    }
                    async.setImmediate(q.process);
                });
            }

            var workers = 0;
            var q = {
                tasks: [],
                concurrency: concurrency,
                saturated: null,
                empty: null,
                drain: null,
                push: function (data, callback) {
                    _insert(q, data, false, callback);
                },
                unshift: function (data, callback) {
                    _insert(q, data, true, callback);
                },
                process: function () {
                    if (workers < q.concurrency && q.tasks.length) {
                        var task = q.tasks.shift();
                        if (q.empty && q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var next = function () {
                            workers -= 1;
                            if (task.callback) {
                                task.callback.apply(task, arguments);
                            }
                            if (q.drain && q.tasks.length + workers === 0) {
                                q.drain();
                            }
                            q.process();
                        };
                        var cb = only_once(next);
                        worker(task.data, cb);
                    }
                },
                length: function () {
                    return q.tasks.length;
                },
                running: function () {
                    return workers;
                }
            };
            return q;
        };

        async.cargo = function (worker, payload) {
            var working     = false,
                tasks       = [];

            var cargo = {
                tasks: tasks,
                payload: payload,
                saturated: null,
                empty: null,
                drain: null,
                push: function (data, callback) {
                    if(data.constructor !== Array) {
                        data = [data];
                    }
                    _each(data, function(task) {
                        tasks.push({
                            data: task,
                            callback: typeof callback === 'function' ? callback : null
                        });
                        if (cargo.saturated && tasks.length === payload) {
                            cargo.saturated();
                        }
                    });
                    async.setImmediate(cargo.process);
                },
                process: function process() {
                    if (working) return;
                    if (tasks.length === 0) {
                        if(cargo.drain) cargo.drain();
                        return;
                    }

                    var ts = typeof payload === 'number'
                        ? tasks.splice(0, payload)
                        : tasks.splice(0);

                    var ds = _map(ts, function (task) {
                        return task.data;
                    });

                    if(cargo.empty) cargo.empty();
                    working = true;
                    worker(ds, function () {
                        working = false;

                        var args = arguments;
                        _each(ts, function (data) {
                            if (data.callback) {
                                data.callback.apply(null, args);
                            }
                        });

                        process();
                    });
                },
                length: function () {
                    return tasks.length;
                },
                running: function () {
                    return working;
                }
            };
            return cargo;
        };

        var _console_fn = function (name) {
            return function (fn) {
                var args = Array.prototype.slice.call(arguments, 1);
                fn.apply(null, args.concat([function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (typeof console !== 'undefined') {
                        if (err) {
                            if (console.error) {
                                console.error(err);
                            }
                        }
                        else if (console[name]) {
                            _each(args, function (x) {
                                console[name](x);
                            });
                        }
                    }
                }]));
            };
        };
        async.log = _console_fn('log');
        async.dir = _console_fn('dir');
        /*async.info = _console_fn('info');
         async.warn = _console_fn('warn');
         async.error = _console_fn('error');*/

        async.memoize = function (fn, hasher) {
            var memo = {};
            var queues = {};
            hasher = hasher || function (x) {
                return x;
            };
            var memoized = function () {
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                var key = hasher.apply(null, args);
                if (key in memo) {
                    callback.apply(null, memo[key]);
                }
                else if (key in queues) {
                    queues[key].push(callback);
                }
                else {
                    queues[key] = [callback];
                    fn.apply(null, args.concat([function () {
                        memo[key] = arguments;
                        var q = queues[key];
                        delete queues[key];
                        for (var i = 0, l = q.length; i < l; i++) {
                            q[i].apply(null, arguments);
                        }
                    }]));
                }
            };
            memoized.memo = memo;
            memoized.unmemoized = fn;
            return memoized;
        };

        async.unmemoize = function (fn) {
            return function () {
                return (fn.unmemoized || fn).apply(null, arguments);
            };
        };

        async.times = function (count, iterator, callback) {
            var counter = [];
            for (var i = 0; i < count; i++) {
                counter.push(i);
            }
            return async.map(counter, iterator, callback);
        };

        async.timesSeries = function (count, iterator, callback) {
            var counter = [];
            for (var i = 0; i < count; i++) {
                counter.push(i);
            }
            return async.mapSeries(counter, iterator, callback);
        };

        async.compose = function (/* functions... */) {
            var fns = Array.prototype.reverse.call(arguments);
            return function () {
                var that = this;
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                async.reduce(fns, args, function (newargs, fn, cb) {
                        fn.apply(that, newargs.concat([function () {
                            var err = arguments[0];
                            var nextargs = Array.prototype.slice.call(arguments, 1);
                            cb(err, nextargs);
                        }]))
                    },
                    function (err, results) {
                        callback.apply(that, [err].concat(results));
                    });
            };
        };

        var _applyEach = function (eachfn, fns /*args...*/) {
            var go = function () {
                var that = this;
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                return eachfn(fns, function (fn, cb) {
                        fn.apply(that, args.concat([cb]));
                    },
                    callback);
            };
            if (arguments.length > 2) {
                var args = Array.prototype.slice.call(arguments, 2);
                return go.apply(this, args);
            }
            else {
                return go;
            }
        };
        async.applyEach = doParallel(_applyEach);
        async.applyEachSeries = doSeries(_applyEach);

        async.forever = function (fn, callback) {
            function next(err) {
                if (err) {
                    if (callback) {
                        return callback(err);
                    }
                    throw err;
                }
                fn(next);
            }
            next();
        };

        /*
         // AMD / RequireJS
         if (typeof define !== 'undefined' && define.amd) {
         define([], function () {
         return async;
         });
         }
         // Node.js
         else if (typeof module !== 'undefined' && module.exports) {
         module.exports = async;
         }
         // included directly via <script> tag
         else {
         root.async = async;
         }
         */

        root.async = async;

    }());


})(jQuery);