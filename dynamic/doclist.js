(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");
            require("css!ratchet/dynamic/doclist.css");

            var Ratchet = require("ratchet/web");

            var gadget = require("ratchet/dynamic/list");
            var jQuery = require("jquery");

            var Configuration = require("ratchet/config");
            var Actions = require("ratchet/actions");

            return factory(Ratchet, gadget, jQuery, Configuration, Actions);
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

    return Ratchet.Gadgets.DocList = Ratchet.DynamicRegistry.register("doclist", gadget.extend({

        constructor: function(type, ratchet, id) {
            this.base(type, ratchet, id);

            this._clickAction = function(actionId, actionContext, callback)
            {
                // look up the action configuration
                var actionConfig = Actions.config(actionId);
                if (actionConfig)
                {
                    // execute the action
                    Actions.execute(actionId, actionConfig, actionContext, function(err, result) {
                        if (callback) {
                            callback(err, result);
                        }
                    });

                    return false;
                }
            };
        },

        /**
         * @override
         */
        configureDefault: function()
        {
            // call this first
            this.base();

            // now add in our custom configuration
            this.config(this.doclistDefaultConfig());
        },

        doclistDefaultConfig: function()
        {
            return {
                "checkbox": true,
                "icon": true,
                "buttons": [],
                "columns": [{
                    "key": "titleDescription",
                    "title": "Document"
                }],
                "loader": "remote",
                "lengthMenu": {
                    "values": [10, 25, 50, 100, 999999],
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
                    },
                    "options-filter": {
                        "options": []
                    }
                }
            };
        },

        /**
         * @override
         */
        configureAutowire: function()
        {
            // call this first
            this.base();
        },

        /**
         * Extension point for letting configuration service load model configuration for doclist.
         *
         * @param model
         */
        applyDynamicConfiguration: function(model)
        {
        },

        /**
         * Auto-configures additional model state based on current model properties.
         *
         * @param model
         */
        autoDynamicConfiguration: function(model)
        {
            // sort-selector-group
            if (model["selectorGroups"]) {
                if (model["selectorGroups"]["sort-selector-group"]) {
                    if (model["selectorGroups"]["sort-selector-group"]["fields"]) {
                        if (model["selectorGroups"]["sort-selector-group"]["fields"].length > 0) {
                            model.buttons.push({
                                "key": "sort-direction-selector",
                                "align": "right"
                            },{
                                "key": "sort-selector",
                                "title": "Sort...",
                                "align": "right",
                                //"iconClass": "icon-pencil",
                                "buttons": []
                            });
                        }
                    }
                }
            }

            // multi-documents-action-selector-group
            if (model["selectorGroups"]) {
                if (model["selectorGroups"]["multi-documents-action-selector-group"]) {
                    if (model["selectorGroups"]["multi-documents-action-selector-group"]["actions"]) {
                        if (model["selectorGroups"]["multi-documents-action-selector-group"]["actions"].length > 0) {
                            model.buttons.push({
                                "key": "multi-documents-action-selector",
                                "title": "Selected...",
                                "align": "right"//,
                                //"iconClass": "icon-pencil"
                            });
                        }
                    }
                }
            }

            // options filter
            if (model["selectorGroups"]) {
                if (model["selectorGroups"]["options-filter"]) {
                    if (model["selectorGroups"]["options-filter"]["options"]) {
                        if (model["selectorGroups"]["options-filter"]["options"].length > 0) {

                            var button = {
                                "key": "options-filter",
                                "align": "left",
                                "select": true,
                                "options": []
                            };
                            var x = model["selectorGroups"]["options-filter"]["options"];
                            for (var i = 0; i < x.length; i++) {
                                button.options.push({
                                    "label": x[i].title,
                                    "value": x[i].key,
                                    "selected": x[i].selected
                                });
                            }

                            model.buttons.push(button);
                        }
                    }
                }
            }

            // add a column to the table for ACTIONS if configured?
            if (model.actions)
            {
                if (!model["selectorGroups"]) {
                    model["selectorGroups"] = {};
                }
                if (!model["selectorGroups"]["single-document-action-selector-group"]) {
                    model["selectorGroups"]["single-document-action-selector-group"] = {};
                }
                if (!model["selectorGroups"]["single-document-action-selector-group"]["actions"]) {
                    model["selectorGroups"]["single-document-action-selector-group"]["actions"] = [];
                }

                // ensure actions column
                var actionColumn = null;
                if (model.columns && model.columns.length > 0)
                {
                    for (var z = 0; z < model.columns.length; z++)
                    {
                        if (model.columns[z].key === "actions")
                        {
                            actionColumn = model.columns[z];
                            break;
                        }
                    }
                }

                if (!actionColumn)
                {
                    actionColumn = {
                        "key": "actions",
                        "title": ""
                    };
                    model.columns.push(actionColumn);
                }
                if (!actionColumn.selector) {
                    actionColumn.selector = {
                        "title": "Actions..."
                    };
                }
            }
        },

        autoConfigureTableConfig: function(model, tableConfig)
        {
            var self = this;

            var entityTypes = self.entityTypes(model);

            tableConfig.language.lengthMenu = "Display _MENU_ " + entityTypes.plural + " per page";
            tableConfig.language.info = "Showing _START_ to _END_ of _TOTAL_ " + entityTypes.plural;
            tableConfig.language.infoEmpty = "Showing 0 to 0 of 0 " + entityTypes.plural;
            tableConfig.language.infoFiltered = "(filtered from _MAX_ total " + entityTypes.plural + ")";
            tableConfig.language.zeroRecords = "No " + entityTypes.plural + " were found";
        },

        entityTypes: function(model)
        {
            return {
                "plural": "documents",
                "singular": "document"
            }
        },

        /**
         * @override
         */
        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                self.applyDynamicConfiguration(model);

                self.autoDynamicConfiguration(model);

                // if there is a ""sort-selector" button (dropdown)
                var sortButton = self._findButton(model, "sort-selector");
                if (sortButton)
                {
                    if (!sortButton.buttons) {
                        sortButton.buttons = [];
                    }
                    Ratchet.clearArray(sortButton.buttons);

                    // load actions from the "sort-selector" dropdown configuration
                    var selectorGroup = model["selectorGroups"]["sort-selector-group"];
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

                    var currentSortField = self.sort(model);
                    if (currentSortField)
                    {
                        var newSortButtonTitle = null;

                        if (model.selectorGroups) {
                            if (model.selectorGroups["sort-selector-group"]) {
                                var fields = model.selectorGroups["sort-selector-group"].fields;
                                if (fields) {
                                    for (var i = 0; i < fields.length; i++) {
                                        if (fields[i].field === currentSortField) {
                                            newSortButtonTitle = fields[i].title ? fields[i].title : fields[i].field;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        sortButton.title = "Sort...";
                        if (newSortButtonTitle) {
                            sortButton.title = newSortButtonTitle + "...";
                        }
                    }
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
                    var selectorGroup = model["selectorGroups"]["multi-documents-action-selector-group"];
                    $.each(selectorGroup.actions, function(index, selectorGroupItem) {

                        var button = null;

                        if (selectorGroupItem.divider)
                        {
                            button = {
                                "key": "multi-documents-action-separator" + index,
                                "divider": true,
                                "selectorGroup": "multi-documents-action-selector-group"
                            };
                        }
                        else
                        {
                            var actionId = selectorGroupItem.action;
                            //var order = selectorGroupItem.order;

                            // retrieve the action configuration
                            var actionConfig = null;
                            var globalConfig = Configuration.evaluate();
                            if (globalConfig["actions"] && globalConfig["actions"][actionId])
                            {
                                actionConfig = globalConfig["actions"][actionId];
                            }
                            if (!actionConfig)
                            {
                                // skip this one
                                Ratchet.logWarn("The action: " + actionId + " could not be found in actions config for selector group: multi-documents-action-selector-group");
                            }
                            else
                            {
                                var title = actionConfig.title;
                                if (!title)
                                {
                                    title = "Unknown Action Title";
                                }

                                button = {
                                    "key": "multi-documents-action-" + actionId,
                                    "title": title,
                                    "action": actionId,
                                    "selectorGroup": "multi-documents-action-selector-group"
                                };

                                if (actionConfig.iconClass)
                                {
                                    button.iconClass = actionConfig.iconClass;
                                }

                                if (selectorGroupItem.selectionMode) {
                                    button.selectionMode = selectorGroupItem.selectionMode;
                                }

                            }
                        }

                        if (button)
                        {
                            if (selectorGroupItem.allowPermission)
                            {
                                button.allowPermission = selectorGroupItem.allowPermission;
                            }
                            if (selectorGroupItem.rejectPermission)
                            {
                                button.rejectPermission = selectorGroupItem.rejectPermission;
                            }
                            if (selectorGroupItem.allowAuthority)
                            {
                                button.allowAuthority = selectorGroupItem.allowAuthority;
                            }
                            if (selectorGroupItem.rejectAuthority)
                            {
                                button.rejectAuthority = selectorGroupItem.rejectAuthority;
                            }

                            selectButton.buttons.push(button);
                        }

                    });

                    // allow for custom sort of select
                    self.sortFilterButtons(selectButton.buttons);
                }

                // if there is an "options-filter", update with value of currently selected value
                // update "selected"
                var optionsFilterButton = self._findButton(model, "options-filter");
                if (optionsFilterButton)
                {
                    var currentOptionsFilter = self.optionsFilter(model);
                    if (currentOptionsFilter)
                    {
                        var options = optionsFilterButton.options;
                        if (options) {
                            for (var i = 0; i < options.length; i++) {
                                options[i].selected = (options[i].value === currentOptionsFilter);
                            }
                        }
                    }
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

        /**
         * @override
         */
        afterSwap: function(el, model, context, callback)
        {
            var self = this;

            this.base(el, model, context, function() {

                $(el).find(".list-button-multi-documents-action-selector").addClass("disabled");

                self.formatSortDirectionSelector(model, el);

                callback();
            });
        },

        onActivateToggler: function(element, id)
        {
        },

        onDeactivateToggler: function(element, id)
        {
        },

        isTogglerActive: function(id)
        {
            var self = this;

            var togglerMap = self.store("togglerMap") || {};

            return togglerMap[id];
        },

        clickButtonBarButton: function(event, model, button)
        {
            var self = this;

            if (button.selectorGroup === "sort-selector-group")
            {
                self.sort(model, button.field);
            }
            else if (button.key === "sort-direction-selector")
            {
                var sortDirection = self.sortDirection(model) * -1;
                self.sortDirection(model, sortDirection);

                self.formatSortDirectionSelector(model);
            }
            else if (button.url)
            {
                var x = {
                    "url": button.url
                };
                Ratchet.substituteVariables(x, model);
                window.location.href = x.url;
            }
            else if (button.action)
            {
                // fire the action
                var actionContext = self.buildActionContext(model, button);

                return this._clickAction(actionContext.id, actionContext, function(err, data) {
                    self.afterActionComplete(actionContext.id, actionContext, err, data);
                });
            }
        },

        changeButtonBarSelect: function(event, model, button, value)
        {
            var self = this;

            if (button.key === "options-filter")
            {
                self.optionsFilter(model, value);
            }
        },

        buildActionContext: function(model, button)
        {
            var self = this;

            var actionContext = {};
            actionContext.id = button.action;
            actionContext.model = Ratchet.copyOf(model);
            actionContext.ratchet = self.ratchet();

            if (button.selectorGroup === "multi-documents-action-selector-group")
            {
                actionContext.data = self.selectedItems(model);
            }

            actionContext.selectedItems = self.selectedItems(model);

            // reference to the current gadget
            actionContext.gadget = self;

            // useful methods
            actionContext.observable = self.observable;
            actionContext.trigger = self.trigger;
            actionContext.on = self.on;
            actionContext.substituteVariables = function(obj, callback) {
                self.substituteVariables(null, model, obj);

                if (callback) {
                    callback();
                }

            };
            actionContext.button = button;

            self.customizeActionContext(actionContext, model, button);

            return actionContext;
        },

        customizeActionContext: function(actionContext, model, button)
        {

        },

        /**
         * EXTENSION POINT
         *
         * @param actionId
         * @param actionContext
         * @param err
         * @param data
         */
        afterActionComplete: function(actionId, actionContext, err, data)
        {
        },

        columnValue: function(row, item, model, context)
        {
            var self = this;

            var value = this.base();

            var project = self.observable("project").get();
            var user = self.observable("user").get();

            if (item.key == "actions") {

                var id = "list-button-single-document-select-" + row.id;

                // action drop down
                var MODAL_TEMPLATE = ' \
                    <div class="single-document-action-holder">\
                        <ul role="menu" aria-labelledby="' + id + '"> \
                        </ul> \
                    </div> \
                ';

                var template = $(MODAL_TEMPLATE);

                // load actions from the "single-document-action-selector-group" configuration
                var selectorGroup = model["selectorGroups"]["single-document-action-selector-group"];
                if (!selectorGroup) {
                    selectorGroup = {};
                }
                if (!selectorGroup.actions) {
                    selectorGroup.actions = [];
                }
                selectorGroup = JSON.parse(JSON.stringify(selectorGroup));
                self.populateSingleDocumentActions(row, item, model, context, selectorGroup);

                $.each(selectorGroup.actions, function(index, selectorGroupItem) {

                    var link = selectorGroupItem.link;
                    var actionId = selectorGroupItem.action;
                    var iconClass = selectorGroupItem.iconClass;
                    //var order = selectorGroupItem.order;

                    var id = row.id;
                    if (!id && row._doc) {
                        id = row._doc;
                    }
                    if (!id && row.getId) {
                        id = row.getId();
                    }

                    var html = null;

                    if (link)
                    {
                        if (window.Handlebars)
                        {
                            var linkModel = {
                                "document": row,
                                "project": project,
                                "user": user
                            };

                            var templateFunction = Handlebars.compile(link);
                            link = templateFunction(linkModel);
                        }

                        html = "<a href='" + link + "' list-row-id='" + id + "'>";
                        html += "<i class='action-icon " + iconClass + "'></i>";
                        html += "</a>";
                    }
                    else if (actionId)
                    {
                        // retrieve the action configuration
                        var actionConfig = Actions.config(actionId);
                        if (!actionConfig)
                        {
                            // skip this one
                            Ratchet.logWarn("The action: " + actionId + " could not be found in actions config for selector group: single-document-action-selector-group");
                        }
                        else
                        {
                            html = "<a href='#' class='list-button-action list-button-action-" + actionId + "' list-action-id='" + actionId + "' list-row-id='" + id + "'>";
                            html += "<i class='action-icon " + iconClass + "'></i>";
                            html += "</a>";
                        }
                    }

                    if (html)
                    {
                        $(template).find("ul").append("<li>" + html + "</li>");
                    }

                });

                return $(template).outerHTML();
            }

            return value;
        },

        rowCallback: function(el, model, table, nRow, aData, iDisplayIndex)
        {
            this.base(el, model, table, nRow, aData, iDisplayIndex);

            var self = this;

            // make sure other click handlers are released
            // this is important because datatables sometimes calls handleRowCallback multiple times...?
            $(nRow).find('.list-button-action').off();

            $(nRow).find('.list-button-action').click(function(event) {

                var actionId = $(this).attr("list-action-id");
                var rowId = $(this).attr("list-row-id");

                var item = self._findRow(model, rowId);

                var actionContext = {};
                actionContext.ratchet = self.ratchet();
                actionContext.model = model;
                actionContext.data = [item];

                // reference to the current gadget
                actionContext.gadget = self;

                // useful methods
                actionContext.observable = self.observable;
                actionContext.trigger = self.trigger;
                actionContext.on = self.on;
                actionContext.substituteVariables = function(obj, callback) {
                    self.substituteVariables(null, model, obj);

                    if (callback) {
                        callback();
                    }

                };

                self.customizeActionContext(actionContext, model);

                // prevent the event from propagating (so as to prevent following href attributes on anchor)
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();

                return self._clickAction(actionId, actionContext, function(err, data) {
                    self.afterActionComplete(actionId, actionContext, err, data);
                });

            });

            // support for toggle buttons
            $(nRow).find(".list-toggler").off().click(function(e) {
                e.preventDefault();

                var isActive = $(this).attr("data-list-toggler-state") === "on";
                var togglerId = $(this).attr("data-list-toggler-id");

                var togglerMap = self.store("togglerMap") || {};
                if (isActive)
                {
                    // deactivate
                    delete togglerMap[togglerId];
                }
                else
                {
                    // activate
                    togglerMap[togglerId] = true;
                }

                // store back
                self.store("togglerMap", togglerMap);

                // fire events
                if (isActive)
                {
                    // now deactivated
                    self.onDeactivateToggler.call(self, this, togglerId);
                }
                else
                {
                    // now activated
                    self.onActivateToggler.call(self, this, togglerId);
                }
            });
        },

        configureColumn: function(column, config)
        {
            this.base(column, config);

            // if this is the actions column, set button to render in middle and align right
            if (column.key == "actions")
            {
                config["className"] = "actions";
                config["width"] = "150px";
            }
        },

        formatSortDirectionSelector: function(model, el)
        {
            var self = this;

            var selector = $(".list-button-sort-direction-selector");
            if (el)
            {
                selector = $(el).find(".list-button-sort-direction-selector");
            }

            // set up sort selector
            var sortDirection = self.sortDirection(model);
            if (sortDirection == -1)
            {
                $(selector).html("<div class='sort-descending'></div>");
            }
            else if (sortDirection == 1)
            {
                $(selector).html("<div class='sort-ascending'></div>");
            }
        },

        changeSelectedItems: function(model, el)
        {
            var self = this;

            this.base(model, el);

            var selectedItems = this.selectedItems(model);

            // either enable or disable the selected... buttons
            $(".list-button-multi-documents-action-selector").addClass("disabled");

            // if we have selected items, then enable selected... buttons
            if (selectedItems.length > 0) {
                $(".list-button-multi-documents-action-selector").removeClass("disabled");
            }

            // TODO: update the "selected..." options based on what is selected
            // some might work on multiple, some might only work on 1 at a time
            // should also take into account what capabilities you have against each item
            var multiSelectButton = self._findButton(model, "multi-documents-action-selector");
            if (multiSelectButton)
            {
                for (var i = 0; i < multiSelectButton.buttons.length; i++)
                {
                    var disable = false;

                    if (multiSelectButton.buttons[i].selectionMode === "none")
                    {
                        disable = (selectedItems.length !== 0);
                    }
                    else if (multiSelectButton.buttons[i].selectionMode === "one")
                    {
                        disable = (selectedItems.length !== 1);
                    }
                    else if (multiSelectButton.buttons[i].selectionMode === "two")
                    {
                        disable = (selectedItems.length !== 2);
                    }
                    /*
                    else if (multiSelectButton.buttons[i].selectionMode === "any")
                    {
                        disable = (selectedItems.length > 1);
                    }
                    */

                    var ul = $("[role='menu'][aria-labelledby='list-button-multi-documents-action-selector']");
                    var a = $(ul).find(".list-button-multi-documents-action-" + multiSelectButton.buttons[i].action);

                    $(a).parent().prop("disabled", false);
                    $(a).parent().removeClass("disabled");
                    $(a).prop("disabled", false);
                    $(a).removeClass("disabled");

                    if (disable)
                    {
                        $(a).parent().prop("disabled", true);
                        $(a).parent().addClass("disabled");
                        $(a).prop("disabled", true);
                        $(a).addClass("disabled");
                    }

                }
            }
        },

        /**
         * Extension point.
         *
         * @param buttons
         */
        sortFilterButtons: function(buttons)
        {

        },

        /**
         * Extension point.
         *
         * @param row
         * @param item
         * @param model
         * @param context
         * @param selectorGroup
         */
        populateSingleDocumentActions: function(row, item, model, context, selectorGroup)
        {

        }

    }));

}));
