(function($)
{
    Ratchet.GadgetRegistry.register("docviewer", Ratchet.Gadgets.DocViewer.extend({

        TEMPLATE: "../../src/dynamic/docviewer.html",

        setup: function()
        {
            this.get(this.index);
        }

    }));

})(jQuery);