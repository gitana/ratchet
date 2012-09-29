Ratchet.Gadgets.Links = Ratchet.AbstractDynamicGadget.extend({

    TEMPLATE: "core/gadgets/links",
    RUNTIME_CONTROLLER: "_gadgets/_runtime"

});

Ratchet.GadgetRegistry.register("links", Ratchet.Gadgets.Links);
