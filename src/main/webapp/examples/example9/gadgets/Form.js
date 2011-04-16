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

        index: function(el)
        {
            var _this = this;

            el.model["value"] = this.observable("value").get();

            el.transform("templates/form", function(el) {

                el.find("input").keyup(function() {
                    _this.observable("value").set(this.value);
                });

                el.swap();
            });
        }

    });

    Ratchet.GadgetRegistry.register("form", Form);

})(jQuery);