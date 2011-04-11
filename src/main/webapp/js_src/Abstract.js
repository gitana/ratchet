(function(window)
{
    if (typeof Ratchet === "undefined")
    {
        /** @namespace */
        Ratchet = {};
        Ratchet.uniqueIdCounter = 0;
    }

    Ratchet.Abstract = Base.extend(
    {
        constructor: function()
        {
            //////////////////////////////////////////////////////////////////////////////////////////////
            //
            // PRIVILEGED METHODS
            //
            //////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * PRIVILEGED METHOD
             * Builds an array from javascript method arguments.
             *
             * @inner
             *
             * @param {arguments} arguments
             *
             * @returns {Array} an array
             */
            this.makeArray = function(arguments) {
                return Array.prototype.slice.call(arguments);
            };

            /**
             * PRIVILEGED METHOD
             * Serializes a object into a JSON string and optionally makes it pretty by indenting.
             *
             * @inner
             *
             * @param {Object} object The javascript object.
             * @param {Boolean} pretty Whether the resulting string should have indentation.
             *
             * @returns {String} string
             */
            this.buildString = function(object, pretty) {

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
             * PRIVILEGED METHOD
             * Determines whether the given argument is a String.
             *
             * @inner
             *
             * @param arg argument
             *
             * @returns {Boolean} whether it is a String
             */
            this.isString = function( arg ) {
                return (typeof arg == "string");
            };

            /**
             * PRIVILEGED METHOD
             * Determines whether the given argument is a Function.
             *
             * @inner
             *
             * @param arg argument
             *
             * @returns {Boolean} whether it is a Function
             */
            this.isFunction = function(arg) {
                return Object.prototype.toString.call(arg) === "[object Function]";
            };

            /**
             * PRIVILEGED METHOD
             * Determines whether a bit of text starts with a given prefix.
             *
             * @inner
             *
             * @param {String} text A bit of text.
             * @param {String} prefix The prefix.
             *
             * @returns {Boolean} whether the text starts with the prefix.
             */
            this.startsWith = function(text, prefix) {
                return text.substr(0, prefix.length) === prefix;
            };

            /**
             * PRIVILEGED METHOD
             * Copies the members of the source object into the target object.
             * This includes both properties and functions from the source object.
             *
             * @inner
             *
             * @param {Object} target Target object.
             * @param {Object} source Source object.
             */
            this.copyInto = function(target, source) {
                for (var i in source) {
                    if (source.hasOwnProperty(i) && !this.isFunction(this[i])) {
                        target[i] = source[i];
                    }
                }
            };

            this.isUndefined = function(obj)
            {
                return (typeof obj == "undefined");
            };

            this.isEmpty = function(obj)
            {
                return this.isUndefined(obj) || obj == null;
            };

            this.generateId = function()
            {
                Ratchet.uniqueIdCounter++;
                return "ratchet-" + Ratchet.uniqueIdCounter;
            };

            this.isNode = function(o)
            {
                return (
                        typeof Node === "object" ? o instanceof Node :
                                typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string");
            };

            this.isElement = function(o)
            {
                return (
                        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
                                typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string");
            };

            this.debug = function(str)
            {
                if (!this.isUndefined(console))
                {
                    console.log(str);
                }
            }

        }

    });

    window.Ratchet = Ratchet;

})(window);