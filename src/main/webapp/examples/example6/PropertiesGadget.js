(function($)
{
    PropertiesGadget = Ratchet.Gadget.extend(
    {
        constructor: function(dispatcher, container)
        {
            this.base(dispatcher, container);
        },

        setup: function(modelAndView)
        {
            var _this = this;

            this.firstName = modelAndView.observable("firstName");
            this.lastName = modelAndView.observable("lastName");
            this.fullName = modelAndView.observable("fullName");

            // make sure we're subscribed to receive notifications of updates to these observers
            this.firstName.subscribe("properties", function() { _this.render.call(_this); });
            this.lastName.subscribe("properties", function() { _this.render.call(_this); });
        },

        render: function()
        {
            $(this.getContainer()).html("PROPERTIES<br/><br/>First name: " + this.firstName.get() + "<br/>Last name: " + this.lastName.get() + "<br/>Full name: " + this.fullName.get());
        },

        onChangeTitle: function()
        {
            this.render();
        },

        onChangeDescription: function()
        {
            this.render();
        }

    });

    Ratchet.GadgetRegistry.register("properties", PropertiesGadget);

})(jQuery);