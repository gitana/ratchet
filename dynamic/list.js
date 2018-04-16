(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");
            require("css!ratchet/dynamic/list.css");

            var html = require("text!ratchet/dynamic/list.html");
            var Ratchet = require("ratchet/web");

            require("ratchet/handlebars");
            require("bootstrap");
            require("datatables");
            require("datatables-bootstrap");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./list.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.Gadgets.List = Ratchet.DynamicRegistry.register("list", Ratchet.AbstractDynamicGadget.extend({

        TEMPLATE: html,

        constructor: function(type, ratchet, id) {
            this.base(type, ratchet, id);

            var self = this;

            this._removeButton = function(model, buttonKey)
            {
                if (model.buttons)
                {
                    var index = -1;
                    for (var i = 0; i < model.buttons.length; i++) {
                        var x = model.buttons[i];
                        if (x.key === buttonKey) {
                            index = i;
                            break;
                        }
                    }

                    if (index > -1)
                    {
                        model.buttons.splice(index, 1);
                    }
                }
            };

            this._findButton = function(model, buttonKey)
            {
                var button = null;
                if (model.buttons)
                {
                    for (var i = 0; i < model.buttons.length; i++) {
                        var x = model.buttons[i];
                        if (x.key === buttonKey) {
                            button = x;
                        }
                    }
                }

                return button;
            };

            this._findRow = function(model, rowId)
            {
                var row = null;

                for (var i = 0; i < model.rows.length; i++)
                {
                    if (model.rows[i].id == rowId)
                    {
                        row = model.rows[i];
                        break;
                    }
                }

                return row;
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
            this.config({
                "columnHeaders": true,
                "buttons": [],
                "navbox": false,
                "defaultFirstColumnAsId": true,
                "options": {
                    "filter": true,
                    "paginate": true,
                    "info": true,
                    "sizing": true,
                    "processing": true
                },
                "observables": {
                    "query": "query",
                    "sort": "sort",
                    "sortDirection": "sortDirection",
                    "searchTerm": "searchTerm",
                    "selectedItems": "selectedItems",
                    "length": "length",
                    "optionsFilter": "optionsFilter"
                }
            });
        },



        //////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // OBSERVABLE ACCESSORS
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////////

        selectedItems: function(model, array) {

            var observable = this.observable(model.observables.selectedItems);
            if (array) {
                observable.set(array);
            }

            var selectedItems = observable.get();
            if (!selectedItems) {
                selectedItems = [];
            }

            return selectedItems;
        },

        clearSelectedItems: function(model) {

            var observable = this.observable(model.observables.selectedItems);
            observable.clear();
        },

        /**
         * Either -1 (descending) or 1 (ascending)
         *
         * @param sortDirection
         */
        sortDirection: function(model, sortDirection)
        {
            var observable = this.observable(model.observables.sortDirection);
            if (!Ratchet.isUndefined(sortDirection))
            {
                observable.set(sortDirection);
            }

            // assume sort ascending
            sortDirection = 1;

            // if the model specifies a default sort direction, we use that
            if (model.options && typeof(model.options.defaultSortDirection) !== "undefined")
            {
                sortDirection = model.options.defaultSortDirection;
            }
            if (observable && observable.get()) {
                sortDirection = observable.get();
            }

            return sortDirection;
        },

        /**
         * Sort field (get or set)
         *
         * @param sortField
         * @return {*}
         */
        sort: function(model, sortField)
        {
            var observable = this.observable(model.observables.sort);
            if (!Ratchet.isUndefined(sortField))
            {
                observable.set(sortField);
            }

            var sort = null;
            // if the model specifies a default sort, we use that
            if (model.options && model.options.defaultSort)
            {
                sort = model.options.defaultSort;
            }
            if (observable && observable.get())
            {
                sort = observable.get();
            }

            return sort;
        },

        /**
         * Options filter (get or set)
         *
         * @param model
         * @param option
         * @return {*}
         */
        optionsFilter: function(model, option)
        {
            var observable = this.observable(model.observables.optionsFilter);
            if (!Ratchet.isUndefined(option))
            {
                observable.set(option);
            }

            var optionsFilter = null;

            if (observable && observable.get())
            {
                optionsFilter = observable.get();
            }

            return optionsFilter;
        },


        //////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // RENDERING LOGIC
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////////

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                if (!model.items)
                {
                    model.items = [];
                }

                var length = self.observable(model.observables.length).get();
                if (length)
                {
                    model.length = length;
                }

                callback();
            });
        },

        postFilterModel: function(model, callback)
        {
            var self = this;

            if (model.buttons)
            {
                for (var i = 0; i < model.buttons.length; i++)
                {
                    var button = model.buttons[i];

                    if (button.buttons && button.buttons.length == 0)
                    {
                        model.buttons.splice(i,1);
                    }

                }
            }

            callback();
        },

        beforeSwap: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                // set up observables
                var refreshHandler = self.refreshHandler(el);

                // when the "query" observable changes, update the list
                self.subscribe(model.observables.query, refreshHandler);
                // when the "sort" observable changes, update the list
                self.subscribe(model.observables.sort, refreshHandler);
                // when the "sort direction" observable changes, update the list
                self.subscribe(model.observables.sortDirection, refreshHandler);
                // when the "options filter" observable changes, update the list
                self.subscribe(model.observables.optionsFilter, refreshHandler);

                // clear selected items
                self.clearSelectedItems(model);

                // when the selected items change
                self.subscribe(model.observables.selectedItems, function() {
                    self.handleChangeSelectedItems(model, el);
                });

                callback();

            });
        },

        tableConfig: function()
        {
            return {
                "autoWidth": true,
                "jQueryUI": false,
                "ordering": true,
                "searching": true,
                "filter": true,
                "paging": true,
                "processing": true,
                "info": true,
                "lengthChange": true,
                "serverSide": true,
                "columns": [],
                "language": {
                    "lengthMenu": "Display _MENU_ records per page",
                    "zeroRecords": "No items were found.",
                    "info": "Showing _START_ to _END_ of _TOTAL_ records",
                    "infoEmpty": "Showing 0 to 0 of 0 records",
                    "infoFiltered": "(filtered from _MAX_ total records)",
                    "search": "Filter:"
                }
            };
        },

        afterSwap: function(el, model, context, callback)
        {
            var self = this;

            //////////////////////////////////////////////////////////////////////////////
            //
            // DEFINE THE DATA TABLE
            //
            //////////////////////////////////////////////////////////////////////////////

            // default table config
            var tableConfig = self.tableConfig();

            if (model.options)
            {
                if (typeof(model.options.ordering) != "undefined")
                {
                    tableConfig.ordering = model.options.ordering;
                }
                if (typeof(model.options.searching) != "undefined")
                {
                    tableConfig.searching = model.options.searching;
                }
                if (typeof(model.options.filter) != "undefined")        // legacy
                {
                    tableConfig.searching = model.options.filter;
                }
                if (typeof(model.options.paging) != "undefined")
                {
                    tableConfig.paging = model.options.paging;
                }
                if (typeof(model.options.paginate) != "undefined")      // legacy
                {
                    tableConfig.paging = model.options.paginate;
                }
                if (typeof(model.options.processing) != "undefined") {
                    tableConfig.processing = model.options.processing;
                }
                if (typeof(model.options.info) != "undefined") {
                    tableConfig.info = model.options.info;
                }
                if (typeof(model.options.lengthChange) != "undefined")
                {
                    tableConfig.lengthChange = model.options.lengthChange;
                }
                if (typeof(model.options.sizing) != "undefined")        // legacy
                {
                    tableConfig.lengthChange = model.options.sizing;
                }

                if (typeof(model.options.zeroRecords) != "undefined")
                {
                    if (!tableConfig.language) {
                        tableConfig.language = {};
                    }
                    tableConfig.language.zeroRecords = model.options.zeroRecords;
                }

            }

            // bootstrap
            //tableConfig["sDom"] = '<"top"i>rt<"bottom"flp><"clear">';
            //tableConfig["sDom"] = '<"top"i>rt<"bottom"flp><"clear">';
            //tableConfig["sDom"] = "<'row'<'col-md-6'T><'col-md-6'f>r>t<'row'<'col-md-6'i><'col-md-6'p>>";

            // @see http://datatables.net/usage/options
            /**
             'l' - Length changing
             'f' - Filtering input
             't' - The table!
             'i' - Information
             'p' - Pagination
             'r' - pRocessing
             */

            if (!tableConfig["sDom"])
            {
                if (tableConfig.searching)
                {
                    if (tableConfig.paging)
                    {
                        if (tableConfig.info)
                        {
                            if (tableConfig.lengthChange)
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rlft>><'row'<'col-md-6'i><'col-md-6'p>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'lft>><'row'<'col-md-6'i><'col-md-6'p>>";
                                }
                            }
                            else
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rft>><'row'<'col-md-6'i><'col-md-6'p>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'ft>><'row'<'col-md-6'i><'col-md-6'p>>";
                                }
                            }
                        }
                        else
                        {
                            if (tableConfig.lengthChange)
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rlft>><'row'<'col-md-6'><'col-md-6'p>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'lft>><'row'<'col-md-6'><'col-md-6'p>>";
                                }
                            }
                            else
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rft>><'row'<'col-md-6'><'col-md-6'p>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'ft>><'row'<'col-md-6'><'col-md-6'p>>";
                                }
                            }
                        }
                    }
                    else
                    {
                        if (tableConfig.info)
                        {
                            if (tableConfig.lengthChange)
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rlft>><'row'<'col-md-6'i><'col-md-6'>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'lft>><'row'<'col-md-6'i><'col-md-6'>>";
                                }
                            }
                            else
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rft>><'row'<'col-md-6'i><'col-md-6'>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'ft>><'row'<'col-md-6'i><'col-md-6'>>";
                                }
                            }
                        }
                        else
                        {
                            if (tableConfig.lengthChange)
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rlft>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'lft>>";
                                }
                            }
                            else
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rft>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'ft>>";
                                }
                            }
                        }
                    }
                }
                else
                {
                    if (tableConfig.paging)
                    {
                        if (tableConfig.info)
                        {
                            if (tableConfig.lengthChange)
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rlt>><'row'<'col-md-6'i><'col-md-6'p>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'lt>><'row'<'col-md-6'i><'col-md-6'p>>";
                                }
                            }
                            else
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rt>><'row'<'col-md-6'i><'col-md-6'p>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rt>><'row'<'col-md-6'i><'col-md-6'p>>";
                                }
                            }
                        }
                        else
                        {
                            if (tableConfig.lengthChange)
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rlt>><'row'<'col-md-6'><'col-md-6'p>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'lt>><'row'<'col-md-6'><'col-md-6'p>>";
                                }
                            }
                            else
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rt>><'row'<'col-md-6'><'col-md-6'p>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12't>><'row'<'col-md-6'><'col-md-6'p>>";
                                }
                            }
                        }
                    }
                    else
                    {
                        if (tableConfig.info)
                        {
                            if (tableConfig.lengthChange)
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rlt>><'row'<'col-md-6'i><'col-md-6'>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'lt>><'row'<'col-md-6'i><'col-md-6'>>";
                                }
                            }
                            else
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rt>><'row'<'col-md-6'i><'col-md-6'>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12't>><'row'<'col-md-6'i><'col-md-6'>>";
                                }
                            }
                        }
                        else
                        {
                            if (tableConfig.lengthChange)
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rlt>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'lt>>";
                                }
                            }
                            else
                            {
                                if (tableConfig.processing)
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12'rt>>";
                                }
                                else
                                {
                                    tableConfig["sDom"] = "<'row'<'col-md-12't>>";
                                }
                            }
                        }
                    }
                }
            }

            if (model.lengthMenu)
            {
                tableConfig["lengthMenu"] = [];
                tableConfig["lengthMenu"].push(model.lengthMenu.values);
                tableConfig["lengthMenu"].push(model.lengthMenu.labels);
                //[[10, 25, 50, -1], [10, 25, 50, "All"]]
            }

            if (model.length)
            {
                tableConfig["pageLength"] = model.length;
            }

            var tableExists = ($(el).find(".display").length > 0);
            if (tableExists) {
                tableConfig.bDestroy = tableExists;
            }
            //tableConfig["serverSide"] = true;
            //tableConfig["columns"] = [];
            if (model.checkbox)
            {
                tableConfig["columns"].push({
                    "visible": true,
                    "searchable": false,
                    "orderable": false,
                    "width": "10px",
                    "title": "<input type='checkbox' class='list-check-box-all'/>",
                    "className": "list-checkbox-column"
                });
            }
            else if (model.radio)
            {
                tableConfig["columns"].push({
                    "visible": true,
                    "searchable": false,
                    "orderable": false,
                    "width": "10px",
                    "title": "",
                    "className": "list-radio-column"
                });
            }
            if (model.icon)
            {
                tableConfig["columns"].push({
                    "visible": true,
                    "searchable": false,
                    "orderable": false,
                    "title": "",
                    /*"width": "70px",*/
                    "className": "list-icon-column"
                });
            }

            // initial sort order
            tableConfig.order = [];

            this.sort(model);

            tableConfig.order = [];

            /*
            // apply sort from observable
            var sortField = self.sort(model);
            if (sortField)
            {
                var sortDirection = self.sortDirection(model);
                if (1 == sortDirection) {
                    sortDirection = "asc";
                } else if (-1 == sortDirection) {
                    sortDirection = "desc";
                }

                tableConfig.order = [sortField, sortDirection];
            }
            */

            // custom hook for specifying settings-driven overrides
            self.applyDynamicTableConfig(model, tableConfig, function(tableConfig) {

                // push for each column
                if (model.columns)
                {
                    for (var i = 0; i < model.columns.length; i++) {
                        var column = model.columns[i];

                        var columnSortable = false;
                        if (!Ratchet.isEmpty(column.sort)) {
                            columnSortable = column.sort;
                        }
                        if (!Ratchet.isEmpty(column.sortable)) {
                            columnSortable = column.sortable;
                        }
                        if (!Ratchet.isEmpty(column.orderable)) {
                            columnSortable = column.orderable;
                        }

                        var config = {
                            "visible": true,
                            "searchable": true,
                            "orderable": columnSortable
                        };

                        if (column.hidden) {
                            config["visible"] = false;
                        }

                        if (column.cssClasses)
                        {
                            config.className = column.cssClasses;
                        }

                        // custom column configuration hook
                        self.handleConfigureColumn(column, config);

                        tableConfig["columns"].push(config);
                    }
                }
                else
                {
                    throw new Error("Missing model.columns");
                }

                //////////////////////////////////////////////////////////////////////////////
                //
                // FUNCTIONS FOR INTERPRETING DATA THAT IS LOADED INTO THE TABLE
                //
                //////////////////////////////////////////////////////////////////////////////

                // load
                tableConfig["ajax"] = function(data, fnCallback, settings)
                {
                    // build json that we'll pass into data tables
                    var json = {};
                    json["draw"] = data["draw"];
                    json["data"] = [];


                    //////////////////////////////////////////////////////////////////////////////
                    // SEARCH TERM
                    //////////////////////////////////////////////////////////////////////////////

                    // allow search term from data tables default control
                    var searchTerm = null;
                    if (data.search && data.search.value)
                    {
                        searchTerm = data.search.value;
                    }
                    if (!searchTerm) {

                        // if not specified, allow lookup from an observable
                        searchTerm = self.observable(model.observables.searchTerm).get();
                    }


                    //////////////////////////////////////////////////////////////////////////////
                    // QUERY
                    //////////////////////////////////////////////////////////////////////////////

                    // allow query to be set from an external observable
                    var query = self.observable(model.observables.query).get();
                    if (!query) {
                        query = {};
                    }



                    //////////////////////////////////////////////////////////////////////////////
                    // PAGINATION
                    //////////////////////////////////////////////////////////////////////////////

                    var pagination = {
                        "skip": data["start"],
                        "limit": data["length"]
                    };

                    // apply sort to pagination
                    if (data.order && data.order.length > 0)
                    {
                        var sortColIndex = data.order[0].column;
                        if (sortColIndex > 1) {
                            var sortColProperty = model.columns[sortColIndex - 2].property;
                            if (sortColProperty)
                            {
                                pagination["sort"] = {};
                                var direction = data.order[0].dir == 'asc' ? -1 : 1;
                                if (Ratchet.isString((sortColProperty))) {
                                    pagination["sort"][sortColProperty] = direction;
                                }
                                if (Ratchet.isFunction(sortColProperty) && model.columns[sortColIndex - 2].sortingExpression) {
                                    pagination["sort"][model.columns[sortColIndex - 2].sortingExpression] = direction;
                                }
                            }
                        }
                    }

                    // if sort not defined, see we can derive from sort direction buttons
                    if (!pagination.sort)
                    {
                        // uses default or -1 if not supplied
                        var sortDirection = self.sortDirection(model);

                        // apply sort from observable?
                        var sortField = self.sort(model);
                        if (!sortField)
                        {
                            sortField = model.options.defaultSort;
                        }
                        if (!sortField)
                        {
                            sortField = self.getDefaultSortField(model);
                        }

                        if (sortField)
                        {
                            pagination["sort"] = {};
                            pagination["sort"][sortField] = sortDirection;
                        }
                    }

                    // if sort to provided, allow for a default sort
                    if (!pagination.sort)
                    {
                        self.applyDefaultSort(pagination);
                    }





                    //////////////////////////////////////////////////////////////////////////////
                    // LOAD FROM SERVER
                    //////////////////////////////////////////////////////////////////////////////

                    var loaderId = model.loader;
                    if (!loaderId) {
                        loaderId = "default";
                    }
                    var loader = self.loaders[loaderId];
                    if (!loader) {
                        throw new Error("Cannot find loader: " + loaderId);
                    }

                    // allow query to be modified based on observable context ahead of call to loader
                    self.preconfigureBeforeLoader.call(self, context, model, data, searchTerm, query, pagination);

                    self.startProcessing.call(self, context, model);

                    loader.call(self, context, model, data, settings, searchTerm, query, pagination, function(array, attrs) {

                        // ensure "id" field in place
                        if (model.rows && model.rows.length > 0)
                        {
                            for (var i = 0; i < model.rows.length; i++)
                            {
                                if (!model.rows[i].id) {
                                    model.rows[i].id = model.rows[i]._doc;
                                }
                            }
                        }

                        for (var i = 0; i < array.length; i++)
                        {
                            json["data"].push(array[i]);
                        }

                        if (attrs)
                        {
                            if (attrs.recordsTotal || attrs.recordsTotal == 0)
                            {
                                json["recordsTotal"] = attrs.recordsTotal;
                            }

                            if (attrs.recordsFiltered || attrs.recordsFiltered == 0)
                            {
                                json["recordsFiltered"] = attrs.recordsFiltered;
                            }
                        }

                        self.endProcessing.call(self, context, model, json);

                        fnCallback(json);
                    });
                };


                // register callbacks
                tableConfig["createdRow"] = function( nRow, aData, iDataIndex ) {
                    self.handleCreatedRow.call(self, el, model, this, nRow, aData, iDataIndex);
                };
                tableConfig["rowCallback"] = function(nRow, aData, iDisplayIndex) {
                    self.handleRowCallback.call(self, el, model, this, nRow, aData, iDisplayIndex);
                };
                tableConfig["initComplete"] = function(oSettings, json) {
                    self.handleInitComplete.call(self, el, model, this, oSettings, json, callback);
                };





                if (model.tableConfig) {
                    $.extend(true, tableConfig, model.tableConfig);
                }

                if (model.hideCheckbox) {
                    tableConfig["columns"][0]["visible"] = false;
                } else if (model.hideRadio) {
                    tableConfig["columns"][0]["visible"] = false;
                }

                if (model.hideIcon) {
                    tableConfig["columns"][1]["visible"] = false;
                }

                tableConfig.drawCallback = function(settings) {
                    self.handleDrawCallback.call(self, el, model, this, settings);
                };

                // RENDER THE TABLE
                self.oTable = $(el).find("table").dataTable(tableConfig);
                $(self.oTable).on("length.dt", function(e, settings, len) {
                    self.handleLengthChange.call(self, el, model, self.oTable, len);
                });



                // select/unselect-all checkbox
                $(el).find(".list-check-box-all").click(function(e) {

                    if ($(this).prop("checked")) {
                        $(el).find(".list-check-box").each(function() {
                            if (! $(this).prop("checked")) {
                                $(this).prop("checked", true);
                            }
                        });
                        self.clearSelectedItems(model);

                        var items = [];
                        $(el).find("input:checkbox[list-target-object-id]").each(function() {

                            var itemId = $(this).attr("list-target-object-id");

                            // find the item row
                            var item = null;
                            for (var i = 0; i < model.rows.length; i++)
                            {
                                if (model.rows[i].id == itemId)
                                {
                                    item = model.rows[i];
                                    break;
                                }
                            }
                            items.push(item);
                        });
                        self.selectedItems(model, items);
                    } else {

                        $(el).find(".list-check-box").each(function() {
                            if ($(this).prop("checked")) {
                                $(this).prop("checked", false);
                            }
                        });
                        self.clearSelectedItems(model);
                    }

                    //e.preventDefault();
                });

                $(el).find("[data-selected='true']").each(function() {
                    var key = $(this).attr("data-select-key");
                    var label = $(this).attr("data-select-label");
                    $(el).find("#dropdown-menu-" + key + " .dropdown-title").html(label);

                });

                // handle any other dom element bindings for the list
                self.handleBindEvents(el, model);

                // init any buttons
                $('.dropdown-toggle', el).dropdown();

                // if we have a display length selector, adjust it for bootstrap 3 manually
                $(".dataTables_length label select", el).addClass("form-control");

                // if we have a filter box, adjust it for bootstrap 3 manually
                $(".dataTables_filter label input", el).addClass("form-control").css("width", "initial");

                // for any sorting columns, it seems we need to manually trigger a resize in order for the
                // columns not to lose their responsiveness
                $(el).find("th.sorting,th.sorting_asc,th.sorting_desc").click(function(e) {
                    setTimeout(function() {
                        $(window).trigger("resize");
                    }, 250);
                });

                // if the display length changes, we need to trigger a window resize for the same reason as above
                $(".dataTables_length label select", el).click(function(e) {
                    setTimeout(function() {
                        $(window).trigger("resize");
                    }, 250);
                });

                // all done - fire callback
                //callback();
            });
        },

        /**
         * Extension point
         *
         * @returns {null}
         */
        getDefaultSortField: function()
        {
            return null;
        },

        /**
         * Extension point.
         *
         * @param context
         * @param model
         * @param data
         * @param searchTerm
         * @param query
         * @param pagination
         */
        preconfigureBeforeLoader: function(context, model, data, searchTerm, query, pagination)
        {

        },

        /**
         * Default method for converting a result map object to a data list row.
         *
         * @param _doc
         * @param obj
         */
        handleRowObject: function(_doc, obj)
        {
            if (obj["id"])
            {
                obj["_original_id"] = obj["id"];
            }

            obj["id"] = _doc;
        },

        /**
         * Converts a single row of JSON data to a DataTables format.
         *
         * The incoming JSON row looks like:
         *
         *   {
         *     "id": "id1",
         *     "title": "title1",
         *     "description": "description1"
         *   }
         *
         * And the data table JSON row that gets generated looks like:
         *
         *   {
         *     "DT_RowId": "id1",
         *     "DT_RowClass": "row_id1",
         *     "0": "title1",
         *     "1": "description1"
         *   }
         *
         * This method takes into account the configuration of the list control for things like links, checkboxes
         * and icon columns.
         */
        toDataTableRow: function(model, row, context)
        {
            var self = this;



            //////////////////////////////////////////////////////////////////////////////
            //
            // LINK URI
            //
            //////////////////////////////////////////////////////////////////////////////

            var linkUri = this.linkUri.call(self, row, model, context);



            //////////////////////////////////////////////////////////////////////////////
            //
            // READ ONLY
            //
            //////////////////////////////////////////////////////////////////////////////

            var readOnly = this.isReadOnly.call(self, row);




            //////////////////////////////////////////////////////////////////////////////
            //
            // DATA
            //
            //////////////////////////////////////////////////////////////////////////////

            var id = row["id"];
            if (!id)
            {
                id = row["_doc"]
            }
            var data = {};
            if (id)
            {
                data["DT_RowId"] = id;
                data["DT_RowClass"] = "row_" + id;
            }

            var counter = 0;

            // COLUMN: checkbox?
            if (model.checkbox)
            {
                if (readOnly) {
                    data["" + counter] = "";
                } else {
                    data["" + counter] = "<input type='checkbox' class='list-check-box' list-target-object-id='" + id + "'>";
                }
                counter++;
            }
            else if (model.radio)
            {
                if (readOnly) {
                    data["" + counter] = "";
                } else {
                    var radioName = "list-radio-selector-" + self.getGadgetId();

                    data["" + counter] = "<input type='radio' name='" + radioName + "' class='list-radio' list-target-object-id='" + id + "'>";
                }
                counter++;
            }

            // COLUMN: icon?
            if (model.icon)
            {
                var markup = "";
                if (self.iconUri) {
                    var iconUri = self.iconUri.call(self, row, model, context);
                    if (iconUri) {
                        if (linkUri){
                            markup = "<a href='" + linkUri + "'";
                            if (model.linkNewWindow) {
                                markup += " target='_blank'"
                            }
                            markup += ">";
                        }
                        markup += "<img align='center' src='" + iconUri + "'>";
                        if (linkUri) {
                            markup += "</a>";
                        }
                    }
                }

                if (!markup && self.iconClass) {
                    var iconClass = self.iconClass.call(self, row, model, context);
                    if (iconClass) {
                        if (linkUri){
                            markup = "<a href='" + linkUri + "'";
                            if (model.linkNewWindow) {
                                markup += " target='_blank'"
                            }
                            markup += ">";
                        }
                        markup += "<div class='" + iconClass + "'></div>";
                        if (linkUri) {
                            markup += "</a>";
                        }
                    }
                }

                data["" + counter] = markup;

                counter++;
            }




            // DATA COLUMNS
            if (model.columns)
            {
                for (var i = 0; i < model.columns.length; i++)
                {
                    var item = model.columns[i];

                    var value = this.handleColumnValue(row, item, model, context, i);
                    data["" + counter] = value;

                    if (!data["" + counter])
                    {
                        data["" + counter] = "";
                        if (i == 0)
                        {
                            if (model.defaultFirstColumnAsId)
                            {
                                data["" + counter] = id;
                            }
                        }
                    }

                    if (item.link && linkUri)
                    {
                        var val = data["" + counter];
                        data["" + counter] = "<a href='" + linkUri + "' >" + val + "</a>";
                    }

                    counter++;
                }
            }
            else
            {
                throw new Error("Missing model.columns property");
            }

            return data;
        },




        ////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // CALLBACKS
        //
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        handleBindEvents: function(el, model) {

            var self = this;

            // for each button, bind to button handler
            if (model.buttons)
            {
                for (var i = 0; i < model.buttons.length; i++)
                {
                    var button = model.buttons[i];

                    if (button.buttons)
                    {
                        // drop down button
                        for (var j = 0; j < button.buttons.length; j++)
                        {
                            var button2 = button.buttons[j];

                            $(el).find(".list-button-" + button2.key).off().click(function(b) {
                                return function(event) {

                                    event.preventDefault();

                                    if ($(this).prop("disabled"))
                                    {
                                        return false;
                                    }

                                    self.handleButtonBarButtonClick.call(self, event, model, b);

                                };
                            }(button2));

                        }
                    }
                    else
                    {
                        if (button.select)
                        {
                            // select changes
                            $(el).find(".list-select-" + button.key).off().click(function(b) {
                                return function(event) {
                                    event.preventDefault();

                                    var v = $(this).attr("data-select-value");

                                    self.handleButtonBarSelectChange.call(self, event, model, b, v);
                                };
                            }(button));
                        }
                        else if (button.checkbox)
                        {
                            // checkbox changes
                            $(el).find(".list-checkbox-" + button.key).off().change(function(b) {
                                return function(event) {
                                    var v = $(event.target).val();
                                    self.handleButtonBarCheckboxChange.call(self, event, model, b, v);

                                    event.preventDefault();
                                };
                            }(button));
                        }
                        else
                        {
                            // single click button
                            $(el).find(".list-button-" + button.key).off().click(function(b) {
                                return function(event) {
                                    self.handleButtonBarButtonClick.call(self, event, model, b);

                                    event.preventDefault();
                                };
                            }(button));
                        }
                    }
                }
            }
        },

        handleDrawCallback: function(el, model, table, settings) {

        },

        handleLengthChange: function(el, model, table, len) {
            this.observable(model.observables.length).set(len);
        },

        handleCreatedRow: function(el, model, table, nRow, aData, iDataIndex) {
            this.createdRow(el, model, table, nRow, aData, iDataIndex);
        },

        handleInitComplete: function(el, model, table, oSettings, json, callback)
        {
            table.fnAdjustColumnSizing();
            table.fnDraw();

            $(el).find('.dataTables_scrollBody').css('overflow','hidden');

            // if columnHeaders is false, hide all column headers using CSS
            if (!model.columnHeaders)
            {
                /*
                $(el).find(".dataTables_wrapper table thead").css({
                    "display": "none"
                });
                */
                $(el).find(".dataTables_wrapper table thead").remove();
            }

            // if processing is false, hide the processing field
            if (model.options && !model.options.processing)
            {
                $(el).find(".dataTables_processing").css("display", "none");

                /*
                // add in some spacing between table and button bar
                $(el).find(".buttonbar").css({
                    "padding-bottom": "20px"
                });
                */
            }

            /*
            // hide the paginators if we don't need them
            if (json.recordsFiltered < oSettings.length)
            {
                $(el).find(".dataTables_paginate").css("display", "none");
            }
            */

            // if no headers, remove top border
            if (!model.columnHeaders)
            {
                $(el).find("table.dataTable").css("border-top", "0px");
            }

            // if we're showing the max number of records, then don't show pagination
            $(el).find(".dataTables_paginate").show();
            if (json.data.length === json.recordsFiltered || !json.recordsFiltered)
            {
                $(el).find(".dataTables_paginate").hide();
            }

            // hide 0 to 0 of 0
            $(el).find(".dataTables_info").show();
            if (json.recordsFiltered === 0 || !json.recordsFiltered)
            {
                $(el).find(".dataTables_info").hide();
            }

            this.initComplete(el, model, table, oSettings, json);

            callback();
        },

        handleRowCallback: function(el, model, table, nRow, aData, iDisplayIndex)
        {
            var self = this;

            // center the checkbox
            $(nRow).find(".list-check-box").parent().css("vertical-align", "middle");

            // individual checkbox selections
            $(nRow).find(".list-check-box").off();
            $(nRow).find(".list-check-box").click(function(el, model, table, nRow, aData, iDisplayIndex) {

                return function(event)
                {
                    var targetObjectId = $(this).attr("list-target-object-id");

                    // find the row item
                    var item = null;
                    for (var i = 0; i < model.rows.length; i++)
                    {
                        if (model.rows[i].id == targetObjectId)
                        {
                            item = model.rows[i];
                            break;
                        }
                    }

                    if (!item)
                    {
                        console.warn("Unable to find list item for id: " + targetObjectId);
                        return;
                    }

                    // add or remove ourselves
                    var currentSelectedItems = self.selectedItems(model);
                    if ($(this).prop("checked"))
                    {
                        currentSelectedItems.push(item);
                    }
                    else
                    {
                        for (var i = 0; i < currentSelectedItems.length; i++)
                        {
                            if (currentSelectedItems[i].id == targetObjectId)
                            {
                                currentSelectedItems.splice(i, 1);
                                break;
                            }
                        }
                    }

                    // set the selected items
                    self.selectedItems(model, currentSelectedItems);

                    //event.preventDefault();
                };
            }(el, model, table, nRow, aData, iDisplayIndex));

            // individual radio selection
            $(nRow).find(".list-radio").off();
            $(nRow).find(".list-radio").click(function(el, model, table, nRow, aData, iDisplayIndex) {

                return function(event)
                {
                    var targetObjectId = $(this).attr("list-target-object-id");

                    // find the row item
                    var item = null;
                    for (var i = 0; i < model.rows.length; i++)
                    {
                        if (model.rows[i].id == targetObjectId)
                        {
                            item = model.rows[i];
                            break;
                        }
                    }

                    // set ourselves to the selected item
                    var currentSelectedItems = [];
                    if (item) {
                        currentSelectedItems.push(item);
                    }

                    // set the selected items
                    self.selectedItems(model, currentSelectedItems);

                    //event.preventDefault();
                };
            }(el, model, table, nRow, aData, iDisplayIndex));

            // if any of our selected items are on the page, select them
            var selectedItems = this.selectedItems(model);
            if (selectedItems && selectedItems.length > 0)
            {
                for (var i = 0; i < selectedItems.length; i++)
                {
                    var selectedId = selectedItems[i].id;

                    $(nRow).find(".list-radio[list-target-object-id='" + selectedId + "']").prop("checked", true);
                    $(nRow).find(".list-check-box[list-target-object-id='" + selectedId + "']").prop("checked", true);
                }
            }

            // callout to extension point
            this.rowCallback(el, model, table, nRow, aData, iDisplayIndex)
        },

        handleColumnValue: function(row, item, model, context, index)
        {
            var value = null;

            var type = item.type;
            if (!type && item.property) {
                type = "property";
            }
            if (type == "property") {
                var property = item.property;
                if (Ratchet.isFunction(property)) {
                    property.call(self, row, function(value, index) {
                        var rowIndex = index ? "" + index : "" + counter;
                        data[rowIndex] = value;
                    });
                }
                else
                {
                    if (property.indexOf(".") > -1)
                    {
                        // dot-notation
                        var v = row;
                        var x = -1;
                        do
                        {
                            x = property.indexOf(".");
                            if (x > -1) {
                                var p1 = property.substring(0, x);
                                property = property.substring(x + 1);

                                v = v[p1];
                            }
                        } while (x > -1);

                        value = v;
                    }
                    else {
                        // simple case (property name)
                        value = row[property];
                    }
                }

                // allows for XSS encoding of auto-acquired column values
                value = this.encodeColumnValue(value, row, item, model, context, index);
            }
            else
            {
                value = this.columnValue(row, item, model, context, index);
            }

            return value;
        },

        /**
         * Extension Point.
         *
         * @param value
         * @param row
         * @param item
         * @param model
         * @param context
         * @param index
         * @returns {*}
         */
        encodeColumnValue: function(value, row, item, model, context, index)
        {
            return value;
        },

        handleButtonBarButtonClick: function(event, model, button)
        {
            // custom handler
            this.clickButtonBarButton(event, model, button);
        },

        handleButtonBarSelectChange: function(event, model, button, value)
        {
            // custom handler
            this.changeButtonBarSelect(event, model, button, value);
        },

        handleButtonBarCheckboxChange: function(event, model, button, value)
        {
            // custom handler
            this.changeButtonBarCheckbox(event, model, button, value);
        },

        handleChangeSelectedItems: function(model, el)
        {
            // custom handler
            this.changeSelectedItems(model, el);
        },

        handleConfigureColumn: function(column, config)
        {
            // custom handler
            this.configureColumn(column, config);
        },








        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // EXTENSION POINTS
        //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * EXTENSION POINT
         */
        startProcessing: function(context, model)
        {

        },

        /**
         * EXTENSION POINT
         */
        endProcessing: function(context, model, json)
        {

        },

        /**
         * EXTENSION POINT
         */
        applyDefaultSort: function(pagination)
        {

        },

        /**
         * EXTENSION POINT
         */
        applyDynamicTableConfig: function(model, config, callback)
        {
            callback(config);
        },

        /**
         * EXTENSION POINT
         */
        createdRow: function(el, model, table, nRow, aData, iDataIndex)
        {
        },

        /**
         * EXTENSION POINT
         */
        initComplete: function(el, model, table, oSettings, json)
        {

        },

        /**
         * EXTENSION POINT
         */
        rowCallback: function(el, model, table, nRow, aData, iDisplayIndex)
        {

        },

        /**
         * EXTENSION POINT
         */
        linkUri: function(row, model, context)
        {
            return null;
        },

        /**
         * EXTENSION POINT
         */
        iconUri: function(row)
        {
            return null;
        },

        /**
         * EXTENSION POINT
         */
        iconClass: function(row)
        {
            return null;
        },

        /**
         * EXTENSION POINT
         */
        isReadOnly: function(row)
        {
            return false;
        },

        /**
         * EXTENSION POINT
         */
        clickButtonBarButton: function(event, model, button)
        {

        },

        /**
         * EXTENSION POINT
         */
        changeButtonBarSelect: function(event, model, button, value)
        {

        },

        /**
         * EXTENSION POINT
         */
        changeButtonBarCheckbox: function(event, model, button, value)
        {

        },

        /**
         * EXTENSION POINT
         *
         * Determines the value to map into a column for a given row/item.
         **/
        columnValue: function(row, item, model, context, index)
        {
            return null;
        },

        /**
         * EXTENSION POINT
         */
        changeSelectedItems: function(model, el)
        {

        },

        /**
         * EXTENSION POINT
         *
         * @see http://www.datatables.net/usage/columns
         */
        configureColumn: function(column, config)
        {

        },








        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // LOADERS
        //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /*
         * Loads the data from the server and passes it back into the callback function.
         * We expect back:
         *
         *  [["v1", "v2", "v3"], ["v1", "v2", "v3"]]
         */
        loaders: {

            "default": function(context, model, data, settings, searchTerm, query, pagination, callback) {

                var self = this;

                // the default implementation simply converts what is in our model.rows into data table
                // it does not deal with searchTerm or query

                var attrs = {
                    "recordsTotal": 0,
                    "recordsFiltered": 0
                };

                var array = [];
                if (model.rows)
                {
                    for (var i = 0; i < model.rows.length; i++)
                    {
                        var rowData = [];

                        var row = model.rows[i];
                        for (var j = 0; j < row.cells.length; j++)
                        {
                            var cell = row.cells[j];

                            rowData.push(cell.value);

                            attrs.recordsTotal++;
                            attrs.recordsFiltered++;
                        }

                        array.push(self.toDataTableRow(model, rowData, context));
                    }
                }

                callback.call(self, array, attrs);
            },

            "gitana": function(context, model, data, settings, searchTerm, query, pagination, callback) {

                var self = this;


                //////////////////////////////////////////////////////////////////////////////
                //
                // LOAD FROM SERVER
                //
                //////////////////////////////////////////////////////////////////////////////

                self.doGitanaQuery.call(self, context, model, searchTerm, query, pagination, function(resultMap) {

                    // TOTAL ROWS
                    var totalRows = -1;
                    if (resultMap.totalRows) {
                        if (Ratchet.isFunction(resultMap.totalRows)) {
                            totalRows = resultMap.totalRows();
                        } else {
                            totalRows = resultMap.totalRows;
                        }
                    }
                    delete resultMap.totalRows;
                    if (!totalRows) {
                        totalRows = 0;
                    }

                    // SIZE
                    var size = -1;
                    if (resultMap.size) {
                        if (Ratchet.isFunction(resultMap.size)) {
                            size = resultMap.size();
                        } else {
                            size = resultMap.size;
                        }
                    }
                    delete resultMap.size;
                    if (!size) {
                        size = 0;
                    }

                    // OFFSET?
                    var offset = -1;
                    if (resultMap.offset) {
                        if (Ratchet.isFunction(resultMap.offset)) {
                            offset = resultMap.offset();
                        } else {
                            offset = resultMap.offset;
                        }
                    }
                    delete resultMap.offset;
                    if (!offset) {
                        offset = 0;
                    }

                    var array = [];
                    var rows = [];

                    Chain(resultMap).each(function(_doc, obj) {
                        self.handleRowObject(_doc, obj);
                        rows.push(obj);
                        array.push(self.toDataTableRow(model, obj, context));
                    }).then(function() {

                        var attrs = {
                            "recordsTotal": totalRows,
                            "recordsFiltered": totalRows
                        };

                        // set onto model
                        model.rows = rows;

                        callback.call(self, array, attrs);

                    });

                });
            },
            "remote": function(context, model, data, settings, searchTerm, query, pagination, callback) {

                var self = this;

                /**
                 * Results should come back like:
                 *
                 *   {
                 *     "totalRows": 0,
                 *     "size": 0,
                 *     "offset": 0,
                 *     "rows": [{}, {}, {}]
                 */
                self.doRemoteQuery.call(self, context, model, searchTerm, query, pagination, function(results) {

                    var array = [];

                    for (var i = 0; i < results.rows.length; i++) {

                        var obj = results.rows[i];

                        array.push(self.toDataTableRow(model, obj, context));
                    }

                    var attrs = {
                        "recordsTotal": (results.totalRows ? results.totalRows : results.total_rows),
                        "recordsFiltered": (results.totalRows ? results.totalRows : results.total_rows)
                    };

                    // set onto model
                    model.rows = results.rows;

                    callback.call(self, array, attrs);
                });

            }
        },

        /**
         * TO BE PROVIDED BY IMPLEMENTATION CLASS IF THE GITANA LOADER IS USED
         *
         * @param context
         * @param model
         * @param query
         * @param pagination
         * @param callback
         */
        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {

        },

        /**
         * TO BE PROVIDED BY IMPLEMENTATION CLASS IF THE REMOTE LOADER IS USED
         *
         * @param context
         * @param model
         * @param query
         * @param searchTerm
         * @param callback
         */
        doRemoteQuery: function(context, model, searchTerm, query, pagination, callback)
        {

        }

    }));

}));

