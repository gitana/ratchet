(function($)
{
    Form = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
        },

        setup: function()
        {
            this.get(this.index);
        },

        index: function()
        {
            var _this = this;

            this.model["value"] = this.observable("value").get();

            this.transform("templates/form", function() {

                $(this).find("input").keyup(function() {
                    _this.observable("value").set(this.value);
                });

                this.swap();
            });
        }

    });

    Ratchet.GadgetRegistry.register("form", Form);

})(jQuery);