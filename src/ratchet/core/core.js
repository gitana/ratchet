define(["./support/Ratchet"], function(Ratchet) {

    // thirdparty
    require("thirdparty/base");
    require("thirdparty/json2");
    require("thirdparty/form2object");
    require("thirdparty/date");

    // core
    //require("./support/Ratchet");
    require("./support/Utils");
    require("./support/Observable");
    require("./support/Observables");
    require("./support/ScopedObservables");
    require("./support/Storage");
    require("./support/RenderContext");
    require("./support/Gadget");
    require("./support/GadgetRegistry");
    require("./support/TemplateEngineRegistry");
    require("./support/BaseTemplateEngine");
    require("./support/AbstractAuthenticator");
    require("./support/Events");
    require("./support/DefaultRegionResolver");
    require("./support/error/ErrorHandlerRegistry");
    require("./support/error/AbstractErrorHandler");

    // jquery support
    require("./support/jQueryAdapter");

    return Ratchet;
});
