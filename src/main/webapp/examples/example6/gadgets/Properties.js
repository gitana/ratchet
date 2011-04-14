(function($)
{
    Properties = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registration
            this.route("/", "GET", this.renderIndex, this.index);

            // custom observables
            this.firstName = this.scope().observable("firstName");
            this.lastName = this.scope().observable("lastName");
            this.fullName = this.scope().observable("fullName");
        },

        index: function(context, model)
        {
            var _this = this;

            // make sure we're subscribed to receive notifications of updates to these observers
            //this.firstName.subscribe("properties", function() { _this.renderIndex.call(_this, context, model); });
            //this.lastName.subscribe("properties", function() { _this.renderIndex.call(_this, context, model); });

            this.firstName.subscribe("properties", this.observationHandler(this, context, model, _this.renderIndex));
            this.lastName.subscribe("properties", this.observationHandler(this, context, model, _this.renderIndex));

            // mark as having succeeded
            this.success(context, model);
        },

        renderIndex: function(context, model)
        {
            model["firstName"] = this.firstName.get();
            model["lastName"] = this.lastName.get();
            model["fullName"] = this.fullName.get();

            this.renderTemplate(context, model, "templates/properties");
        }

    });

    Ratchet.GadgetRegistry.register("properties", Properties);

})(jQuery);