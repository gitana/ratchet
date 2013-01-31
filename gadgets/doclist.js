(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet-gadgets/common.css");
            require("css!ratchet-gadgets/doclist.css");

            var Ratchet = require("ratchet");

            var gadget = require("ratchet-gadgets/list");
            var jQuery = require("jquery");

            var ActionRegistry = require("ratchet-gadgets/action/registry");

            factory(Ratchet, gadget, jQuery, ActionRegistry);

            return Ratchet;
        });
    }
    else
    {
        var gadget = Ratchet.GadgetRegistry.registry["list"][0];
        var ActionRegistry = Ratchet.ActionRegistry;

        return factory(root.Ratchet, gadget, root.$, ActionRegistry);
    }

}(this, function(Ratchet, gadget, $, ActionRegistry) {

    Ratchet.GadgetRegistry.register("doclist", gadget.extend({

        constructor: function(type, ratchet, id) {
            this.base(type, ratchet, id);

            var self = this;

            this.enableRuntimeController = false;
            this.defaultConfig = {
                "checkbox": true,
                "icon": true,
                "buttons": [{
                    "key": "select",
                    "title": "Selected..."
                }],
                "columns": [{
                    "key": "titleDescription",
                    "title": "Document"
                }, {
                    "key": "modifiedBy",
                    "title": "Modified By"
                }, {
                    "key": "modifiedOn",
                    "title": "Modified On"
                }, {
                    "key": "actions",
                    "title": "Actions"
                }],
                "loader": "remote",
                "lengthMenu": {
                    "values": [10, 25, 50, 100, -1],
                    "labels": [10, 25, 50, 100, "All"]
                }
            };

            this._clickAction = function(registryId, actionId, data, callback)
            {
                // find the action and optional evaluator
                var action = ActionRegistry.findAction(registryId, actionId);
                if (!action)
                {
                    throw new Error("Missing action for registry id: " + registryId + " and action id: " + actionId);
                    return;
                }

                var execute = function(action, data)
                {
                    action.execute(data, function() {
                        console.log("Completed Execution!");
                    });
                };

                var evaluator = ActionRegistry.findEvaluator(registryId, actionId);
                if (!evaluator) {
                    evaluator.evaluate(registryId, data, function(valid) {

                        if (!valid) {
                            throw new Error("The action for registryId: " + registryId + " and action id: " + actionId + " evaluated to false, cannot proceed");
                            return;
                        }

                        execute(action, data);
                    })
                }
                else
                {
                    // no evaluator, assume okay to execute
                    execute(action, data);
                }
            }
        },

        prepareModel: function(el, model, callback)
        {
            this.base(el, model, function() {

                callback();

            });
        },

        beforeSwap: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                // when the "query" observable changes, update the list
                self.subscribe(model.observables.query, self.refreshHandler(el));

                callback();
            });

        },

        afterSwap: function(el, model, context, callback)
        {
            this.base(el, model, context, function() {

                $(".list-button-select").addClass("disabled");

            });
        },

        changeSelectedItems: function() {

            this.base();

            var selectedItems = this.selectedItems();

            // either enable or disable the selected... buttons
            $(".list-button-select").addClass("disabled");

            // if we have selected items, then enable selected... buttons
            if (selectedItems.length > 0) {
                $(".list-button-select").removeClass("disabled");
            }
        },

        /**
         * Handles the event for when the user clicks on an action to occur against multiple documents.
         *
         * @param key
         * @param button
         */
        clickMultipleDocumentsAction: function(key, button)
        {
            // selected items
            var selectedItems = this.selectedItems();

            this._clickAction("docListMultipleDocuments", key, selectedItems, function() {
                console.log("clickMultipleDocumentsAction completed");
            });
        },

        clickSingleDocumentAction: function(key, item, button)
        {
            this._clickAction("docListSingleDocument", key, item, function() {
                console.log("clickSingleDocumentAction completed");
            });
        }

    }));

}));
