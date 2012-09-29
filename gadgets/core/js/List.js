Ratchet.Gadgets.List = Ratchet.AbstractDynamicGadget.extend({

    TEMPLATE: "core/gadgets/list",
    RUNTIME_CONTROLLER: "_gadgets/_runtime",

    selectedItems: function() {
        return this._observable("selectedItems", arguments,{});
    },

    clearSelectedItems: function() {
        this.observable("selectedItems").clear();
    },

    itemsCount : function(obj) {

        if (!obj) {
            return 0;
        }

        var count = 0, key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                count++;
            }
        }
        return count;
    },

    firstItem : function(obj) {

        if (!obj) {
            return null;
        }

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return obj[key];
            }
        }
    },

    onSelectedItems: function() {
        var self = this;
        var toolbarName = self.subscription == 'list' ? 'toolbar' : self.subscription + "-toolbar";
        var toolbar = self._observable(toolbarName,[]);
        /*
         if (toolbar && toolbar.items) {
         var displayedItemCounter = 0;
         $.each(toolbar.items, function(key, item) {

         item["visibility"] = item.requiredAuthorities ? false : true;

         if (item.requiredAuthorities) {
         var selectedItemsRequiredAuthorities = [];
         $.each(self.selectedItems(),function(i,v) {
         if ($.isArray(item.requiredAuthorities)) {
         $.each(item.requiredAuthorities,function() {
         var permissioned = this['permissioned'] ? this['permissioned'] : v;
         if ($.isFunction(permissioned)) {
         permissioned = permissioned(v);
         }
         selectedItemsRequiredAuthorities.push({
         "permissioned" : permissioned,
         "permissions" : this['permissions']
         });
         })
         } else {
         var permissioned = item.requiredAuthorities['permissioned'] ? item.requiredAuthorities['permissioned'] : v;
         if ($.isFunction(permissioned)) {
         permissioned = permissioned(v);
         }
         selectedItemsRequiredAuthorities.push({
         "permissioned" : item.requiredAuthorities['permissioned'] ? item.requiredAuthorities['permissioned'] : v,
         "permissions" : item.requiredAuthorities['permissions']
         });
         }
         });
         self.checkAuthorities(function(isEntitled) {
         if (isEntitled) {
         if (item.selection && item.selection == 'single') {
         if (self.itemsCount(self.selectedItems()) == 1) {
         $('#toolbar-item-' + key).show();
         displayedItemCounter ++;
         }
         }
         if (item.selection && item.selection == 'multiple') {
         if (self.itemsCount(self.selectedItems()) >= 1) {
         $('#toolbar-item-' + key).show();
         displayedItemCounter ++;
         }
         }
         }
         item["visibility"] = isEntitled;
         }, selectedItemsRequiredAuthorities);
         }

         if (item.selection && item.selection == 'single') {
         if (self.itemsCount(self.selectedItems()) == 1 && item["visibility"]) {
         $('#toolbar-item-'+key).show();
         displayedItemCounter ++;
         } else {
         $('#toolbar-item-'+key).hide();
         }
         }
         if (item.selection && item.selection == 'multiple') {
         if (self.itemsCount(self.selectedItems()) >= 1 && item["visibility"]) {
         $('#toolbar-item-'+key).show();
         displayedItemCounter ++;
         } else {
         $('#toolbar-item-'+key).hide();
         }
         }
         });

         var options = $.browser.msie ? {
         "left" : "-270px",
         "width" : "225px",
         "z-index" : "999",
         "border" : "1px solid #25333c",
         "display" : "block",
         "position" : "absolute"
         } : {
         "left" : "-280px",
         "width" : "225px",
         "z-index" : "999",
         "border": "1px solid #25333c",
         "border-radius": "5px 5px 5px 5px",
         "box-shadow": "0 0 5px rgba(0, 0, 0, 0.5)"
         };

         $('.list-toolbar').css(options).stickySidebar();

         if (displayedItemCounter == 0) {
         $('.list-toolbar').css({
         "border": "0px none"
         });
         }
         }
         */
    },

    processActions: function(list) {
        var self = this;
        if (list.actions) {
            var toolbarName = self.subscription == 'list' ? 'toolbar' : self.subscription + "-toolbar";
            var toolbar = this._observable(toolbarName,[]);
            for (var action in list.actions) {
                var actionObject = list.actions[action];
                var actionTitle = actionObject.title;
                var actionClick = actionObject.click;
                var actionIcon = actionObject.icon ? actionObject.icon : "";
                var actionSelection = actionObject.selection ? actionObject.selection : 'single';
                // CREATE
                var button = {
                    "id": action,
                    "title": actionTitle,
                    "icon": actionIcon,
                    "selection" : actionSelection,
                    "click": function(actionClick) {
                        return function(event) {
                            if (this.selection == 'single') {
                                if (self.itemsCount(self.selectedItems()) == 1) {
                                    actionClick.call(self, self.firstItem(self.selectedItems()), self.oTable);
                                }
                            } else if (this.selection == 'multiple') {
                                if (self.itemsCount(self.selectedItems()) >= 1) {
                                    actionClick.call(self, self.selectedItems(), self.oTable);
                                }
                            } else if (this.selection == 'none') {
                                actionClick.call(self, self.oTable);
                            }
                        };
                    }(actionClick)
                };
                if (actionObject.requiredAuthorities) {
                    button.requiredAuthorities = actionObject.requiredAuthorities;
                }
                toolbar.items[button.id] = button;
            }
            this.observable(toolbarName).set( toolbar);
        }
    },

    prepareModel: function(el, model, callback)
    {
        if (!model.items)
        {
            model.items = [];
        }

        callback();
    },

    beforeSwap: function(el, model, callback)
    {
        var self = this;

        // detect changes to the list and redraw when they occur
        // this.subscribe(this.subscription, this.refresh);

        /*
         if (this.filterSubscription) {
         this.subscribe(this.filterSubscription, this.refresh);
         }
         */

        self.clearSelectedItems();

        callback();
    },

    afterSwap: function(el, model)
    {
        var self = this;

        //////////////////////////////////////////////////////////////////////////////
        //
        // DEFINE THE DATA TABLE
        //
        //////////////////////////////////////////////////////////////////////////////

        var tableConfig = {
            "bPaginate": true,
            "bFilter": true,
            "bSort": true,
            "bInfo": true,
            "bAutoWidth": false,
            "oLanguage": {
                "sLengthMenu": "Display _MENU_ records per page",
                "sZeroRecords": "Nothing found - sorry",
                "sInfo": "Showing _START_ to _END_ of _TOTAL_ records",
                "sInfoEmpty": "Showing 0 to 0 of 0 records",
                "sInfoFiltered": "(filtered from _MAX_ total records)",
                "sSearch": "Filter:"
            }
        };
        // boostrap
        //tableConfig["sDom"] = "<'row-fluid'<'span6'T><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>";
        /*
        $.extend( $.fn.dataTableExt.oStdClasses, {
            "sWrapper": "dataTables_wrapper form-inline"
        } );
        */

        //tableConfig["bJQueryUI"] = true;
        //tableConfig["sPaginationType"] = "full_numbers";
        var tableExists = ($(el).find(".display").length > 0);
        if (tableExists) {
            tableConfig.bDestroy = tableExists;
        }
        tableConfig["bProcessing"] = true;
        tableConfig["bServerSide"] = true;
        tableConfig["aoColumns"] = [];
        if (model.checkbox)
        {
            tableConfig["aoColumns"].push({
                "bVisible": true,
                "bSearchable": false,
                "bSortable": false,
                "sWidth": "10px",
                "sTitle": "<input type='checkbox' class='table-overall-checkbox'/>"
            });
        }
        if (model.icon)
        {
            tableConfig["aoColumns"].push({
                "bVisible": true,
                "bSearchable": false,
                "bSortable": false,
                "sTitle": ""
            });
        }

        // push for each column
        for (var i = 0; i < model.columns.length; i++) {
            var item = model.columns[i];

            var columnSortable = item.sortingExpression ? true : false;

            var config = {
                "bVisible": true,
                "bSearchable": true,
                "bSortable": columnSortable
            };
            tableConfig["aoColumns"].push(config);
        }




        //////////////////////////////////////////////////////////////////////////////
        //
        // FUNCTIONS FOR INTERPRETING DATA THAT IS LOADED INTO THE TABLE
        //
        //////////////////////////////////////////////////////////////////////////////

        // load
        tableConfig["fnServerData"] = function(sSource, aoData, fnCallback)
        {
            // create key value map for facility of looking up DataTables values
            var keyValues = {};
            for (var i = 0; i < aoData.length; i++) {
                keyValues[aoData[i].name] = aoData[i].value;
            }

            // build json that we'll pass into data tables
            var json = {};
            json["sEcho"] = keyValues["sEcho"];
            json["aaData"] = [];


            //////////////////////////////////////////////////////////////////////////////
            // LOAD FROM SERVER
            //////////////////////////////////////////////////////////////////////////////

            self.loadFunction.call(self, model, keyValues, sSource, aoData, function(aaData, attrs) {

                for (var i = 0; i < aaData.length; i++)
                {
                    json["aaData"].push(aaData[i]);
                }

                if (attrs)
                {
                    if (attrs.iTotalRecords || attrs.iTotalRecords == 0)
                    {
                        json["iTotalRecords"] = attrs.iTotalRecords;
                    }

                    if (attrs.iTotalDisplayRecords || attrs.iTotalDisplayRecords == 0)
                    {
                        json["iTotalDisplayRecords"] = attrs.iTotalDisplayRecords;
                    }
                }

                fnCallback(json);
            });
        };

        // row handling
        tableConfig["fnRowCallback"] = self.rowCallback.call(self, model);

        // callback fired when table finishes drawing
        tableConfig["fnInitComplete"] = function() {

            // TODO: anything?
            this.fnAdjustColumnSizing();
            this.fnDraw();

            $('.dataTables_scrollBody').css('overflow','hidden');

            self.initCompleteCallback();
        };

        if (model.tableConfig) {
            $.extend(true, tableConfig, model.tableConfig);
        }

        if (model.hideCheckbox) {
            tableConfig["aoColumns"][0]["bVisible"] = false;
        }

        if (model.hideIcon) {
            tableConfig["aoColumns"][1]["bVisible"] = false;
        }

        // RENDER THE TABLE
        self.oTable = $(el).find("table").dataTable(tableConfig);

        if (el.uniform) {
            $("select, input:checkbox, input:text, input:password, input:radio, input:file, textarea",$(el)).uniform();
        }

        // select/unselect-all checkbox
        $('.table-overall-checkbox',$(el)).click(function() {
            if ($(this).attr("checked")) {
                $(".gitanaselectbox").each(function() {
                    if (! $(this).attr("checked")) {
                        $(this).attr("checked",true);
                    }
                });
                self.clearSelectedItems();
                var allItems = {};
                /*
                 $.each(map.map,function(key,val) {
                 if( $("input:checkbox[gitanatargetobjectid='" + key +"']").length > 0) {
                 allItems[key] = Chain(val);
                 }
                 });
                 */
                self.selectedItems(allItems);
                self.onSelectedItems();
            } else {
                $(".gitanaselectbox").each(function() {
                    if ($(this).attr("checked")) {
                        $(this).attr("checked",false);
                    }
                });
                self.clearSelectedItems();
                self.onSelectedItems();
            }
        });

        // special actions
        self.processActions(model);

        // init any buttons
        $('.dropdown-toggle', el).dropdown();

        //el.swap();
    },

    /**
     * EXTENSION POINT - OVERRIDE WITH SERVER ACCESS CODE
     *
     * Loads the data from the server and passes it back into the callback function.
     * We expect back:
     *
     *  [["v1", "v2", "v3"], ["v1", "v2", "v3"]]
     *
     */
    loadFunction: function(model, keyValues, sSource, aoData, callback)
    {
        var self = this;

        // the default implementation simply converts what is in our model.rows into data table

        var attrs = {
            "iTotalRecords": 0,
            "iTotalDisplayRecords": 0
        };

        var aaData = [];
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

                    attrs.iTotalRecords++;
                    attrs.iTotalDisplayRecords++;
                }

                aaData.push(self.toDataTableRow(model, rowData));
            }
        }

        callback.call(self, aaData, attrs);
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
    toDataTableRow: function(model, row)
    {
        var self = this;



         //////////////////////////////////////////////////////////////////////////////
         //
         // LINK URI
         //
         //////////////////////////////////////////////////////////////////////////////

         var linkUri = this.linkUri.call(self, row);



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
        var data = {
            "DT_RowId": id,
            "DT_RowClass": "row_" + id
        };
        var counter = 0;

        // COLUMN: checkbox?
        if (model.checkbox)
        {
            if (readOnly) {
                data["" + counter] = "";
            } else {
                data["" + counter] = "<input type='checkbox' class='gitanaselectbox' gitanatargetobjectid='" + id + "'>";
            }
            counter++;
        }


        // COLUMN: icon?
        if (model.icon)
        {
            var iconUri = self.iconUri.call(self, row);

            data["" + counter] = "<img src='" + iconUri + "'>";

            counter++;
        }




        // DATA COLUMNS
        for (var i = 0; i < model.columns.length; i++)
        {
            var item = model.columns[i];

            var type = item.type;
            if (!type) {
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

                        data["" + counter] = v;
                    }
                    else {
                        // simple case (property name)
                        data["" + counter] = row[property];
                    }
                }
            }

            if (!data["" + counter])
            {
                data["" + counter] = "";
                if (i == 0)
                {
                    data["" + counter] = id;
                }
            }


            if (item.link && linkUri)
            {
                var val = data["" + counter];
                data["" + counter] = "<a href='" + linkUri + "'>" + val + "</a>";
            }

            counter++;
        }

        return data;
    },

    rowCallback: function(nRow, aData, iDisplayIndex)
    {
        // mouse over

        $(nRow).mouseover(function() {

            /*
             var mapObject = map.get(aData.DT_RowId);
             //self.selectedItems(mapObject);
             */

            // clear other selected rows
            $(".row_selected").removeClass("row_selected");

            // mark ourselves selected
            $(this).addClass("row_selected");

        });

        /*
         // bind the checkbox selections for this row
         $(nRow).find(".gitanaselectbox").click(function(event) {

         var targetObjectId = $(this).attr("gitanatargetobjectid");
         var item = map.get(targetObjectId);
         var chainedItem = Chain(item);

         var currentSelectedItems = self.selectedItems();

         if ($(this).attr("checked")) {
         currentSelectedItems[targetObjectId] = chainedItem;
         self.selectedItems(currentSelectedItems);
         } else {
         if (currentSelectedItems[targetObjectId]) {
         delete currentSelectedItems[targetObjectId];
         };
         self.selectedItems(currentSelectedItems);
         }

         // Enable or disable buttons
         self.onSelectedItems();
         });
         */

        return nRow;
    },

    /**
     * EXTENSION POINT
     */
    initCompleteCallback: function()
    {

    },

    linkUri: function(row)
    {
        return null;
    },

    iconUri: function(row)
    {
        return null;
    },

    isReadOnly: function(row)
    {
        return false;
    }

});

Ratchet.GadgetRegistry.register("list", Ratchet.Gadgets.List);