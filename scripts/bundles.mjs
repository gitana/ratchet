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
 *   dist/ratchet/<file>  - the same code wrapped as a UMD/AMD module (e.g. "ratchet/web")
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
            "src/thirdparty/base.js",
            "src/thirdparty/json2.js",
            "src/thirdparty/jquery.hashchange.js",
            "src/thirdparty/form2object.js",
            "src/js/Ratchet.js",
            "src/js/Utils.js",
            "src/js/Observable.js",
            "src/js/Observables.js",
            "src/js/ScopedObservables.js",
            "src/js/Storage.js",
            "src/js/RenderContext.js",
            "src/js/Gadget.js",
            "src/js/GadgetRegistry.js",
            "src/js/TemplateEngineRegistry.js",
            "src/js/BaseTemplateEngine.js",
            "src/js/AbstractAuthenticator.js",
            "src/js/Events.js",
            "src/js/jQueryAdapter.js",
            "src/js/DefaultRegionResolver.js"
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
            "src/js/engines/jQueryTemplateEngine.js"
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
            "src/js/engines/HandlebarsTemplateEngine.js"
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
            "src/thirdparty/base.js",
            "src/js/config/Configuration.js",
            "src/js/config/AbstractConfigurationEvaluator.js",
            "src/js/config/TypeConfigurationEvaluator.js",
            "src/js/config/ActionGroupConfigurationEvaluator.js",
            "src/js/config/LocaleConfigurationEvaluator.js",
            "src/js/config/GadgetConfigurationEvaluator.js",
            "src/js/config/ApplicationConfigurationEvaluator.js",
            "src/js/config/PageConfigurationEvaluator.js",
            "src/js/config/ViewerConfigurationEvaluator.js",
            "src/js/config/EditorConfigurationEvaluator.js",
            "src/js/config/logic/and.js",
            "src/js/config/logic/or.js",
            "src/js/config/logic/not.js"
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
            "src/thirdparty/base.js",
            "src/js/actions/Actions.js",
            "src/js/actions/AbstractAction.js",
            "src/js/actions/AbstractUIAction.js",
            "src/js/actions/ConsoleLogAction.js"
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
            "src/thirdparty/base.js",
            "src/thirdparty/date.js",
            "src/js/messages/Messages.js"
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
            "src/thirdparty/base.js",
            "src/js/web/Dynamic.js",
            "src/js/web/AbstractDynamicGadget.js",
            "src/js/web/AbstractDynamicPage.js",
            "src/js/web/DynamicRegionResolver.js",
            "src/js/web/AbstractViewer.js",
            "src/js/web/ViewerRegistry.js",
            "src/js/web/AbstractEditor.js",
            "src/js/web/EditorRegistry.js",
            "src/js/error/ErrorHandlerRegistry.js",
            "src/js/error/AbstractErrorHandler.js"
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
            "src/js/gitana/GitanaAuthentication.js",
            "src/js/gitana/AbstractGitanaAuthenticator.js",
            "src/js/gitana/GitanaImplicitFlowAuthenticator.js",
            "src/js/gitana/GitanaUsernamePasswordAuthenticator.js"
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
