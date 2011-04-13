(function($)
{
    Properties = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registration
            this.route("/", "GET", this.renderIndex, this.index);
        },

        index: function(context, model)
        {
            var _this = this;

            // pull observables off the model
            var firstName = model.observable("firstName");
            var lastName = model.observable("lastName");

            // make sure we're subscribed to receive notifications of updates to these observers
            firstName.subscribe("properties", function() { _this.renderIndex.call(_this, context, model); });
            lastName.subscribe("properties", function() { _this.renderIndex.call(_this, context, model); });

            // mark as having succeeded
            this.success(context, model);
        },

        renderIndex: function(context, model)
        {
            this.renderTemplate(context, model, "templates/properties");
        }

    });

    Ratchet.GadgetRegistry.register("properties", Properties);

})(jQuery);