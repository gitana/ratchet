Ratchet.Gadgets.Dashboard = Ratchet.AbstractDynamicGadget.extend({

    TEMPLATE: "core/gadgets/dashboard",
    RUNTIME_CONTROLLER: "_gadgets/_runtime"

});

Ratchet.GadgetRegistry.register("dashboard", Ratchet.Gadgets.Dashboard);
