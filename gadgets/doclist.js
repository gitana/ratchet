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

            var Configuration = require("ratchet-config/ratchet-config");
            var Actions = require("ratchet-actions/ratchet-actions");

            factory(Ratchet, gadget, jQuery, Configuration, Actions);

            return Ratchet;
        });
    }
    else
    {
        var gadget = Ratchet.GadgetRegistry.registry["list"][0];

        var Configuration = Ratchet.Configuration;
        var Actions = Ratchet.Actions;

        return factory(root.Ratchet, gadget, root.$, Configuration, Actions);
    }

}(this, function(Ratchet, gadget, $, Configuration, Actions) {

    Ratchet.GadgetRegistry.register("doclist", gadget.extend({

        constructor: function(type, ratchet, id) {
            this.base(type, ratchet, id);

            var self = this;

            //this.enableRuntimeController = false;

            this.defaultConfig = {
                "checkbox": true,
                "icon": true,
                "buttons": [{
                    "key": "multi-documents-select",
                    "title": "Selected..."
                }],
                "columns": [{
                    "key": "titleDescription",
                    "title": "Document"
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

            this._clickAction = function(actionGroupId, actionId, data, callback)
            {
                // look up the action configuration
                var actionConfig = null;
                var json = Configuration.evaluate({"action-group": actionGroupId});
                if (json.actions)
                {
                    actionConfig = json.actions[actionId];
                }

                // execute the action
                Actions.execute(actionId, actionConfig, data, function(err, result) {
                    if (callback) {
                        callback(err, result);
                    }
                });
            }
        },

        prepareModel: function(el, model, callback)
        {
            this.base(el, model, function() {

                // if the "multi-documents-select" button is part of the button set
                var selectButton = null;
                if (model.buttons) {
                    for (var i = 0; i < model.buttons.length; i++) {
                        var button = model.buttons[i];
                        if (button.key === "multi-documents-select") {
                            selectButton = button;
                        }
                    }
                }

                if (selectButton) {

                    // load actions from the "multi-documents" configuration
                    var json = Configuration.evaluate({"action-group": "multi-documents"});
                    if (json.actions) {
                        $.each(json.actions, function(actionId, actionConfiguration) {

                            // add a button to the "selected..." drop down
                            if (!selectButton.buttons) {
                                selectButton.buttons = [];
                            }
                            var title = actionConfiguration.title;
                            if (!title) {
                                title = "Unknown Action Title";
                            }
                            selectButton.buttons.push({
                                "key": "multi-action-" + actionId,
                                "title": title,
                                "action": actionId,
                                "actionGroup": "multi-documents",
                                "iconClass": "icon-pencil"
                            });
                        });
                    }
                }

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

                $(".list-button-multi-documents-select").addClass("disabled");

            });
        },

        changeSelectedItems: function() {

            this.base();

            var selectedItems = this.selectedItems();

            // either enable or disable the selected... buttons
            $(".list-button-multi-documents-select").addClass("disabled");

            // if we have selected items, then enable selected... buttons
            if (selectedItems.length > 0) {
                $(".list-button-multi-documents-select").removeClass("disabled");
            }
        },

        clickButton: function(key, button)
        {
            var self = this;

            // handle clicks onto buttons that are automatically wired for actions
            if (button.action && button.actionGroup)
            {
                var data = null;

                if (button.actionGroup === "multi-documents")
                {
                    data = this.selectedItems();
                }
                else if (button.actionGroup === "single-document")
                {
                    // TODO: button item?
                    data = null;
                }

                this._clickAction(button.actionGroup, button.action, data, function(err, data) {
                    var message = "The action completed successfully";
                    if (err) {
                        message = JSON.stringify(err);
                    }
                    Ratchet.showModalMessage("Action Status", message);
                });

            }
        }

    }));

}));
