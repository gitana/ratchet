Ratchet.Gadgets.Display = Ratchet.AbstractDynamicGadget.extend({

    TEMPLATE: "core/gadgets/display",
    RUNTIME_CONTROLLER: "_gadgets/_runtime"

});

Ratchet.GadgetRegistry.register("display", Ratchet.Gadgets.Display);
