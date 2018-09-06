(function (root, factory)
{
    if (typeof define === 'function' && define.amd && !(root && typeof(root.umd) != "undefined") && !root.umd)
    {
        // AMD
        define(function(require, exports, module) {

            require("ratchet/dynamic/common.css");
            require("ratchet/dynamic/selectbar.css");

            var html = require("ratchet/dynamic/selectbar.html");
            var Ratchet = require("ratchet/web");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./selectbar.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.GadgetRegistry.register("selectbar", Ratchet.AbstractDynamicGadget.extend({

        TEMPLATE: html,

        findItem: function(items, itemKey)
        {
            var item = null;
            for (var i = 0; i < items.length; i++)
            {
                if (items[i].key == itemKey)
                {
                    item = items[i];
                    break;
                }
            }

            return item;
        },

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                // figure out which item is the selected one
                if (model.observable)
                {
                    var selectedItemKey = self.observable(model.observable).get();
                    var selectedItem = self.findItem(model.items, selectedItemKey);
                    if (!selectedItem && model.items.length > 0)
                    {
                        selectedItem = model.items[0];
                    }
                    if (selectedItem)
                    {
                        selectedItem.selected = true;
                    }
                }

                callback();

            });
        },

        beforeSwap: function(el, model, callback)
        {
            var self = this;

            // set up observables
            var refreshHandler = self.refreshHandler(el);

            // when the selected item changes, refresh our list
            self.subscribe(model.observable, refreshHandler);

            callback();
        },

        afterSwap: function(el, model, originalContext, callback)
        {
            var self = this;

            /*
            $(el).find("[data-selectbar-item-key]").mouseover(function() {
                $(this).css("cursor", "pointer");
            });
            */

            $(el).find("[data-selectbar-item-key]").click(function(event) {

                event.preventDefault();

                var itemKey = $(this).attr("data-selectbar-item-key");
                var item = self.findItem(model.items, itemKey);
                if (!item)
                {
                    throw new Error("Cannot find item: " + itemKey);
                }

                self.handleClick(this, model, item);
            });

            if (callback)
            {
                callback();
            }

        },

        /**
         * By default, clicking on an item will set an observable if the model.observable field is provided.
         *
         * @param clickedEl
         * @param model
         * @param item
         */
        handleClick: function(clickedEl, model, item)
        {
            var self = this;

            // set the observable
            if (model.observable)
            {
                self.observable(model.observable).set(item.key);
            }
        }

    }));

}));