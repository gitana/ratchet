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
        var gadget = Ratchet.Gadgets.List;

        var Configuration = Ratchet.Configuration;
        var Actions = Ratchet.Actions;

        return factory(root.Ratchet, gadget, root.$, Configuration, Actions);
    }

}(this, function(Ratchet, gadget, $, Configuration, Actions) {

    return Ratchet.Gadgets.DocList = Ratchet.GadgetRegistry.register("doclist", gadget.extend({

        constructor: function(type, ratchet, id) {
            this.base(type, ratchet, id);

            var self = this;

            // add in our configuration
            this.config({
                "checkbox": true,
                "icon": true,
                "buttons": [],
                "columns": [{
                    "key": "titleDescription",
                    "title": "Document"
                }, {
                    "key": "actions",
                    "title": "Actions",
                    "selector": {
                        "title": "Actions..."
                    }
                }],
                "loader": "remote",
                "lengthMenu": {
                    "values": [10, 25, 50, 100, -1],
                    "labels": [10, 25, 50, 100, "All"]
                },
                "selectorGroups": {
                    "multi-documents-action-selector-group": {
                        "actions": []
                    },
                    "single-document-action-selector-group": {
                        "actions": []
                    },
                    "sort-selector-group": {
                        "fields": []
                    }
                }
            });

            this._clickAction = function(actionId, data, callback)
            {
                // look up the action configuration
                var actionConfig = this.config()["actions"][actionId];
                if (actionConfig)
                {
                    // execute the action
                    Actions.execute(actionId, actionConfig, data, function(err, result) {
                        if (callback) {
                            callback(err, result);
                        }
                    });
                }
            };
        },

        setup: function()
        {
            this.base();

            // auto-wire buttons

            // sort-selector-group
            if (this.config()["selectorGroups"]["sort-selector-group"]["fields"].length > 0)
            {
                this.config({
                    "buttons": [{
                        "key": "sort-direction-selector",
                        "align": "right"
                    },{
                        "key": "sort-selector",
                        "title": "Sort...",
                        "align": "right",
                        //"iconClass": "icon-pencil",
                        "buttons": []
                    }]
                });
            }

            // multi-documents-action-selector-group
            if (this.config()["selectorGroups"]["multi-documents-action-selector-group"]["actions"].length > 0)
            {
                this.config({
                    "buttons": [{
                        "key": "multi-documents-action-selector",
                        "title": "Selected...",
                        "align": "right"//,
                        //"iconClass": "icon-pencil"
                    }]
                });
            }
        },

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                // if there is a ""sort-selector" button (dropdown)
                var sortButton = self._findButton(model, "sort-selector");
                if (sortButton)
                {
                    if (!sortButton.buttons) {
                        sortButton.buttons = [];
                    }
                    Ratchet.clearArray(sortButton.buttons);


                    // load actions from the "sort-selector" dropdown configuration
                    var selectorGroup = self.config()["selectorGroups"]["sort-selector-group"];
                    $.each(selectorGroup.fields, function(index, selectorGroupItem) {

                        var key = selectorGroupItem.key;
                        var title = selectorGroupItem.title;
                        if (!title) {
                            title = "Unknown Field";
                        }
                        var field = selectorGroupItem.field;

                        // replace sort button
                        var button = {
                            "key": "sort-field-" + key,
                            "title": title,
                            "field": field,
                            "selectorGroup": "sort-selector-group"
                        };
                        if (selectorGroupItem.iconClass) {
                            button.iconClass = selectorGroupItem.iconClass;
                        }
                        sortButton.buttons.push(button);
                    });
                }

                // if there is a "multi-documents-selector" button (dropdown)
                var selectButton = self._findButton(model, "multi-documents-action-selector");
                if (selectButton)
                {
                    if (!selectButton.buttons) {
                        selectButton.buttons = [];
                    }
                    Ratchet.clearArray(selectButton.buttons);

                    // load actions from the "multi-documents-action-selector" dropdown configuration
                    var selectorGroup = self.config()["selectorGroups"]["multi-documents-action-selector-group"];
                    $.each(selectorGroup.actions, function(index, selectorGroupItem) {

                        var actionId = selectorGroupItem.action;
                        var order = selectorGroupItem.order;

                        // retrieve the action configuration
                        var actionConfig = self.config()["actions"][actionId];
                        if (!actionConfig)
                        {
                            // skip this one
                            Ratchet.logWarn("The action: " + actionId + " could not be found in actions config for selector group: multi-documents-action-selector-group");
                        }
                        else
                        {
                            var title = actionConfig.title;
                            if (!title) {
                                title = "Unknown Action Title";
                            }

                            // replace the "selected" button
                            var button = {
                                "key": "multi-documents-action-" + actionId,
                                "title": title,
                                "action": actionId,
                                "selectorGroup": "multi-documents-action-selector-group"
                            };
                            if (actionConfig.iconClass) {
                                button.iconClass = actionConfig.iconClass;
                            }
                            selectButton.buttons.push(button);
                        }
                    });
                }

                callback();

            });
        },

        beforeSwap: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                callback();
            });

        },

        afterSwap: function(el, model, context, callback)
        {
            var self = this;

            this.base(el, model, context, function() {

                $(".list-button-multi-documents-action-selector").addClass("disabled");

                self.formatSortDirectionSelector();

            });
        },

        changeSelectedItems: function() {

            this.base();

            var selectedItems = this.selectedItems();

            // either enable or disable the selected... buttons
            $(".list-button-multi-documents-action-selector").addClass("disabled");

            // if we have selected items, then enable selected... buttons
            if (selectedItems.length > 0) {
                $(".list-button-multi-documents-action-selector").removeClass("disabled");
            }
        },

        clickButtonBarButton: function(event, model, button)
        {
            var self = this;

            if (button.selectorGroup === "multi-documents-action-selector-group" && button.action)
            {
                var data = this.selectedItems();

                this._clickAction(button.action, data, function(err, data) {
                    var message = "The action completed successfully";
                    if (err) {
                        message = JSON.stringify(err);
                    }
                    Ratchet.showModalMessage("Action Status", message);
                });
            }
            else if (button.selectorGroup === "sort-selector-group")
            {
                self.sort(button.field);
            }
            else if (button.key === "sort-direction-selector")
            {
                var sortDirection = self.sortDirection() * -1;
                self.sortDirection(sortDirection);

                self.formatSortDirectionSelector();
            }
        },

        columnValue: function(row, item)
        {
            var self = this;

            var value = this.base();

            if (item.key == "actions") {

                var id = "list-button-single-document-select-" + row.id;
                var title = "Actions...";
                if (item.selector && item.selector.title) {
                    title = item.selector.title;
                }

                // action drop down
                var MODAL_TEMPLATE = ' \
                    <div class="dropdown single-document-action-dropdown">\
                        <button id="' + id + '" class="btn dropdown-toggle" data-toggle="dropdown">';

                if (item.selector && item.selector.iconClass) {
                    MODAL_TEMPLATE += '<i class="' + item.selector.iconClass + ' icon-black"></i>';
                }
                MODAL_TEMPLATE += title;
                MODAL_TEMPLATE += ' \
                            <span class="caret"></span> \
                        </button> \
                        <ul class="dropdown-menu" role="menu" aria-labelledby="' + id + '"> \
                        </ul> \
                    </div> \
                ';

                var select = $(MODAL_TEMPLATE);

                // load actions from the "single-document-action-selector-group" configuration
                var selectorGroup = this.config()["selectorGroups"]["single-document-action-selector-group"];
                $.each(selectorGroup.actions, function(index, selectorGroupItem) {

                    var actionId = selectorGroupItem.action;
                    var order = selectorGroupItem.order;

                    // retrieve the action configuration
                    var actionConfig = self.config()["actions"][actionId];
                    if (!actionConfig)
                    {
                        // skip this one
                        Ratchet.logWarn("The action: " + actionId + " could not be found in actions config for selector group: single-document-action-selector-group");
                    }
                    else
                    {
                        var title = actionConfig.title;
                        if (!title) {
                            title = "Unknown Action Title";
                        }

                        var html = "<li><a href='#' class='list-button-action list-button-action-" + actionId + "' list-action-id='" + actionId + "' list-row-id='" + row.id + "'>";
                        if (actionConfig.iconClass) {
                            html += "<i class='" + actionConfig.iconClass + "'></i>";
                        }
                        html += "&nbsp;";
                        html += title;
                        html += "</a></li>";

                        $(select).find(".dropdown-menu").append(html);
                    }
                });

                return $(select).outerHTML();
            }

            return value;
        },

        handleRowCallback: function(el, model, table, nRow, aData, iDisplayIndex)
        {
            this.base(el, model, table, nRow, aData, iDisplayIndex);

            var self = this;

            $(el).find('.list-button-action').click(function(event) {

                debugger;

                var actionId = $(this).attr("list-action-id");
                var rowId = $(this).attr("list-row-id");

                var item = self._findRow(model, rowId);

                self._clickAction(actionId, item, function(err, data) {
                    var message = "The action completed successfully";
                    if (err) {
                        message = JSON.stringify(err);
                    }
                    Ratchet.showModalMessage("Action Status", message);
                });

                return false;

            });
        },


        configureColumn: function(column, config)
        {
            this.base(column, config);

            // if this is the actions column, set button to render in middle and align right
            if (column.key == "actions")
            {
                config["sClass"] = "actions";
                config["sWidth"] = "150px";
            }
        },

        formatSortDirectionSelector: function()
        {
            var self = this;

            // set up sort selector
            var sortDirection = self.sortDirection();
            if (sortDirection == -1)
            {
                $(".list-button-sort-direction-selector").html("<div class='sort-descending'></div>");
            }
            else if (sortDirection == 1)
            {
                $(".list-button-sort-direction-selector").html("<div class='sort-ascending'></div>");
            }
        }

    }));

}));
