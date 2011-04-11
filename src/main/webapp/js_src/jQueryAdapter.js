(function($)
{
    $.ratchet = Ratchet.Dispatcher;

    $.fn.ratchet = function(config) {

        // instantate the console on top of the "this" jQuery element
        return new Ratchet.Dispatcher(this, config);

    };

})(jQuery);