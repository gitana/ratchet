(function($)
{
    Body = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registration
            this.route("/", "GET", "templates/body");
        }
    });

    Ratchet.GadgetRegistry.register("body", Body);

})(jQuery);