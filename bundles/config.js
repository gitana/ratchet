(function() {

    // externals

    require("jquery");
    require("ratchet/ratchet");


    ////////////////////////////////////
    // internals
    ////////////////////////////////////

    require("../js/config/Configuration");
    require("../js/config/AbstractConfigurationEvaluator");
    require("../js/config/TypeConfigurationEvaluator");
    require("../js/config/ActionGroupConfigurationEvaluator");
    require("../js/config/LocaleConfigurationEvaluator");
    require("../js/config/GadgetConfigurationEvaluator");
    require("../js/config/ApplicationConfigurationEvaluator");
    require("../js/config/PageConfigurationEvaluator");
    require("../js/config/ViewerConfigurationEvaluator");
    require("../js/config/EditorConfigurationEvaluator");

    require("../js/config/logic/and");
    require("../js/config/logic/or");
    require("../js/config/logic/not");

})();


