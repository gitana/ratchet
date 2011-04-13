(function($)
{
    Header = Ratchet.Gadget.extend(
    {
        constructor: function(ratchet, container)
        {
            this.base(ratchet, container);

            // custom registration
            this.route("/", "GET", "templates/header");
        }
    });

    Ratchet.GadgetRegistry.register("header", Header);

})(jQuery);