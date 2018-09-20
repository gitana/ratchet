define(["ratchet/ratchet", "./AbstractDynamicGadget"], function(Ratchet, AbstractDynamicGadget) {

    return Ratchet.AbstractDashlet = AbstractDynamicGadget.extend({

        setup: function()
        {
            this.get(this.index);
        }

    });

});
