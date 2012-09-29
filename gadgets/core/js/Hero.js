Ratchet.Gadgets.Hero = Ratchet.AbstractDynamicGadget.extend({

    TEMPLATE: "core/gadgets/hero",
    RUNTIME_CONTROLLER: "_gadgets/_runtime"

});

Ratchet.GadgetRegistry.register("hero", Ratchet.Gadgets.Hero);
