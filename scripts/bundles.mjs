/**
 * The Ratchet bundles and the source files that go into each, in load order.
 *
 * Ratchet's sources are plain scripts (not modules) that talk to each other through globals in
 * non-strict mode (e.g. `Ratchet = Base.extend(...)`), so they're concatenated in this order rather
 * than fed to a module bundler.
 *
 * Every bundle is written twice:
 *
 *   dist/js/<name>.js               - plain script for <script> tags (plus .min.js)
 *   dist/components/ratchet/<file>  - the same code wrapped as a UMD/AMD module (e.g. "ratchet/web")
 *
 * `component` describes the UMD wrapper:
 *
 *   deps      - AMD dependencies
 *   params    - factory parameter names
 *   globals   - arguments passed to the factory when loaded as a browser global
 *   variable  - what the factory returns (and the global it's assigned to)
 */
export const bundles = {

    "ratchet": {
        files: [
            "thirdparty/base.js",
            "thirdparty/json2.js",
            "thirdparty/jquery.hashchange.js",
            "thirdparty/form2object.js",
            "js/Ratchet.js",
            "js/Utils.js",
            "js/Observable.js",
            "js/Observables.js",
            "js/ScopedObservables.js",
            "js/Storage.js",
            "js/RenderContext.js",
            "js/Gadget.js",
            "js/GadgetRegistry.js",
            "js/TemplateEngineRegistry.js",
            "js/BaseTemplateEngine.js",
            "js/AbstractAuthenticator.js",
            "js/Events.js",
            "js/jQueryAdapter.js",
            "js/DefaultRegionResolver.js"
        ],
        component: {
            file: "ratchet.js",
            deps: ["jquery"],
            params: ["$"],
            globals: ["root.jQuery"],
            variable: "Ratchet"
        }
    },

    "ratchet-tmpl": {
        files: [
            "js/engines/jQueryTemplateEngine.js"
        ],
        component: {
            file: "tmpl.js",
            deps: ["ratchet/ratchet", "jquery-tmpl"],
            params: ["Ratchet", "Tmpl"],
            globals: ["root.Ratchet"],
            variable: "Ratchet"
        }
    },

    "ratchet-handlebars": {
        files: [
            "js/engines/HandlebarsTemplateEngine.js"
        ],
        component: {
            file: "handlebars.js",
            deps: ["ratchet/ratchet", "handlebars"],
            params: ["Ratchet", "Handlebars"],
            globals: ["root.Ratchet", "root.Handlebars"],
            variable: "Ratchet"
        }
    },

    "ratchet-config": {
        files: [
            "thirdparty/base.js",
            "js/config/Configuration.js",
            "js/config/AbstractConfigurationEvaluator.js",
            "js/config/TypeConfigurationEvaluator.js",
            "js/config/ActionGroupConfigurationEvaluator.js",
            "js/config/LocaleConfigurationEvaluator.js",
            "js/config/GadgetConfigurationEvaluator.js",
            "js/config/ApplicationConfigurationEvaluator.js",
            "js/config/PageConfigurationEvaluator.js",
            "js/config/ViewerConfigurationEvaluator.js",
            "js/config/EditorConfigurationEvaluator.js",
            "js/config/logic/and.js",
            "js/config/logic/or.js",
            "js/config/logic/not.js"
        ],
        component: {
            file: "config.js",
            deps: ["jquery", "ratchet/ratchet"],
            params: ["$", "Ratchet"],
            globals: ["root.jQuery", "root.Ratchet"],
            variable: "Ratchet.Configuration"
        }
    },

    "ratchet-actions": {
        files: [
            "thirdparty/base.js",
            "js/actions/Actions.js",
            "js/actions/AbstractAction.js",
            "js/actions/AbstractUIAction.js",
            "js/actions/ConsoleLogAction.js"
        ],
        component: {
            file: "actions.js",
            deps: ["ratchet/ratchet", "ratchet/config"],
            params: ["Ratchet", "Config"],
            globals: ["root.Ratchet"],
            variable: "Ratchet.Actions"
        }
    },

    "ratchet-messages": {
        files: [
            "thirdparty/base.js",
            "thirdparty/date.js",
            "js/messages/Messages.js"
        ],
        component: {
            file: "messages.js",
            deps: ["ratchet/ratchet", "ratchet/config"],
            params: ["Ratchet", "Config"],
            globals: ["root.Ratchet"],
            variable: "Ratchet.Messages"
        }
    },

    "ratchet-web": {
        files: [
            "thirdparty/base.js",
            "js/web/Dynamic.js",
            "js/web/AbstractDynamicGadget.js",
            "js/web/AbstractDynamicPage.js",
            "js/web/DynamicRegionResolver.js",
            "js/web/AbstractViewer.js",
            "js/web/ViewerRegistry.js",
            "js/web/AbstractEditor.js",
            "js/web/EditorRegistry.js",
            "js/error/ErrorHandlerRegistry.js",
            "js/error/AbstractErrorHandler.js"
        ],
        component: {
            file: "web.js",
            deps: ["ratchet/ratchet", "ratchet/config", "ratchet/messages", "ratchet/actions"],
            params: ["Ratchet", "Config", "Messages", "Actions"],
            globals: ["root.Ratchet"],
            variable: "Ratchet"
        }
    },

    "ratchet-gitana": {
        files: [
            "js/gitana/GitanaAuthentication.js",
            "js/gitana/AbstractGitanaAuthenticator.js",
            "js/gitana/GitanaImplicitFlowAuthenticator.js",
            "js/gitana/GitanaUsernamePasswordAuthenticator.js"
        ],
        component: {
            file: "gitana.js",
            deps: ["ratchet/ratchet", "gitana", "alpaca"],
            params: ["Ratchet", "Gitana", "Alpaca"],
            globals: ["root.Ratchet", "root.Gitana", "root.Alpaca"],
            variable: "Ratchet"
        }
    }
};
