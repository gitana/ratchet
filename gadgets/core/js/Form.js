Ratchet.Gadgets.Form = Ratchet.AbstractDynamicGadget.extend({

    TEMPLATE: "core/gadgets/form",
    RUNTIME_CONTROLLER: "_gadgets/_runtime",

    prepareModel: function(el, model, callback)
    {
        model.formId = "form-" + new Date().getTime();

        callback();
    },

    afterSwap: function(el, model, originalContext, callback)
    {
        var self = this;

        var alpacaConfig = {};

        var data = model.data;
        if (data)
        {
            alpacaConfig.data = data;
        }

        var schema = model.schema;
        if (schema)
        {
            alpacaConfig.schema = schema;
        }

        var options = model.options;
        if (options)
        {
            alpacaConfig.options = options;
        }

        var view = model.view;
        if (view)
        {
            alpacaConfig.view = view;
        }

        alpacaConfig.postRender = function(control)
        {
            self.postRender(control, model, callback);
        };

        /*
        alpacaConfig.onFieldChange = function(name, newValue)
        {
            self.onFieldChange(name, newValue);
        };
        */

        $("#" + model.formId).alpaca(alpacaConfig);
    },

    postRender: function(control, model, callback)
    {
        var self = this;

        $(control.container).find('.form-save').click(function() {

            // open a blocker
            Ratchet.block("Please wait...", "Your changes are being saved.");;

            self.onSave(control, model, function() {
                Ratchet.unblock();
            });
        });

        $(control.container).find('.form-delete').click(function() {

            self.onDelete(control, model, function() {

                // nothing to do

            });
        });

        callback();
    },

    /*
    onFieldChange: function(name, value)
    {

    },
    */

    // EXTENSION POINT
    onSave: function(control, model, callback)
    {
        callback();
    },

    // EXTENSION POINT
    onDelete: function(control, model, callback)
    {
        callback();
    }

});

Ratchet.GadgetRegistry.register("form", Ratchet.Gadgets.Form);
