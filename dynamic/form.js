(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        // AMD
        define(function(require, exports, module) {

            require("css!ratchet/dynamic/common.css");
            require("css!ratchet/dynamic/form.css");

            var html = require("text!ratchet/dynamic/form.html");
            var Ratchet = require("ratchet/web");

            require("ratchet/tmpl");
            require("bootstrap");

            return factory(Ratchet, html);
        });
    }
    else
    {
        return factory(root.Ratchet, "./form.html");
    }

}(this, function(Ratchet, html) {

    return Ratchet.Gadgets.Form = Ratchet.DynamicRegistry.register("form", Ratchet.AbstractDynamicGadget.extend({

        TEMPLATE: html,
		
	    prepareModel: function(el, model, callback)
	    {
            this.base(el, model, function() {

                model.formId = "form-" + new Date().getTime();

                callback();

            });
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
		
	}));
}));
