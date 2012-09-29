Ratchet.Gadgets.Navbar = Ratchet.AbstractDynamicGadget.extend({

    TEMPLATE: "core/gadgets/navbar",
    RUNTIME_CONTROLLER: "_gadgets/_runtime",

    prepareModel: function(el, model, callback)
    {
        // figure out the active page
        var pageKey = this.observable("page").get()["key"];
        for (var i = 0; i < model.items.length; i++)
        {
            var item = model.items[i];
            if (item.key == pageKey)
            {
                item.classes = "active";
            }
        }

        callback();
    }

});

Ratchet.GadgetRegistry.register("navbar", Ratchet.Gadgets.Navbar);
