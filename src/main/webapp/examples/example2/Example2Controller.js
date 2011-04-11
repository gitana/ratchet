(function($)
{
    Example2Controller = Ratchet.Controller.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);
        }

    });

    Ratchet.ControllerRegistry.register("example2", Example2Controller);

})(jQuery);