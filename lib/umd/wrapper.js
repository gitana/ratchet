/**
 * UMD wrapper for compatibility with browser, Node and AMD.
 *
 * Based on:
 *   https://github.com/umdjs/umd/blob/master/returnExports.js
 */
(function (root, factory)
{
    var umdEnabled = true;
    if (root && typeof(root.umd) != "undefined") {
        umdEnabled = root.umd;
    }

    if (umdEnabled && typeof exports === 'object')
    {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    }
    else if (umdEnabled && typeof define === 'function' && define.amd)
    {
        // AMD. Register as an anonymous module.
        define(/** BUILD_INSERT_NAME **/ /** BUILD_INSERT_DEPENDENCIES **/, factory);
    }
    else
    {
        // Browser globals
        root["/** BUILD_INSERT_VARIABLE_NAME **/"] = factory(/** BUILD_INSERT_ARGUMENT_VALUES **/);
    }

}(this, function (/** BUILD_INSERT_ARGUMENTS **/) {

    /** BUILD_INSERT_SCRIPT **/

    return /** BUILD_INSERT_VARIABLE_NAME **/;

}));
