(function($) {

    CloudCMS = {};

    CloudCMS.LIST_FUNCTIONS = {

        loadFunction: function(model, keyValues, sSource, aoData, callback)
        {
            var self = this;

            //////////////////////////////////////////////////////////////////////////////
            //
            // PAGINATION (for Cloud CMS)
            //
            //////////////////////////////////////////////////////////////////////////////

            var pagination = {
                "skip": keyValues["iDisplayStart"],
                "limit": keyValues["iDisplayLength"]
            };

            // apply sort to pagination
            var sortColIndex = keyValues["iSortCol_0"];
            if (sortColIndex > 1) {
                var sortColProperty = model.columns[sortColIndex - 2].property;
                pagination["sort"] = { };
                var direction = keyValues["sSortDir_0"] == 'asc' ? 1 : -1;
                if (Ratchet.isString((sortColProperty))) {
                    pagination["sort"][sortColProperty] = direction;
                }
                if (Ratchet.isFunction(sortColProperty) && model.columns[sortColIndex - 2].sortingExpression) {
                    pagination["sort"][model.columns[sortColIndex - 2].sortingExpression] = direction;
                }
            }


            //////////////////////////////////////////////////////////////////////////////
            //
            // QUERY (for Cloud CMS)
            //
            //////////////////////////////////////////////////////////////////////////////

            var query = {};
            if (keyValues["sSearch"])
            {
                // plug in a query
                query["$or"] = [];

                for (var i = 0; i < model.columns.length; i++)
                {
                    var property = model.columns[i].property;
                    if (Ratchet.isFunction(property)) {
                        property = property.call();
                    }

                    var obj = {};
                    obj[property] = {"$regex": "^" + keyValues["sSearch"] };

                    query["$or"].push(obj);
                }
            }


            //////////////////////////////////////////////////////////////////////////////
            //
            // LOAD FROM SERVER
            //
            //////////////////////////////////////////////////////////////////////////////

            self.doQuery.call(self, model, query, pagination, function(resultmap) {

                var aaData = [];

                for (var k in resultmap.map)
                {
                    var obj = resultmap.map[k].object;
                    obj["id"] = obj["_doc"];

                    aaData.push(self.toDataTableRow(model, obj));
                }

                var attrs = {
                    "iTotalRecords": resultmap.object["total_rows"],
                    "iTotalDisplayRecords": resultmap.object["size"]
                };

                callback.call(self, aaData, attrs);
            });
        },

        /**
         * TO BE PROVIDED BY IMPLEMENTATION CLASS
         */
        doQuery: function(model, query, pagination, callback)
        {

        }

    };

})(jQuery);