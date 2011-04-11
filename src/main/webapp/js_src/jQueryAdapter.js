(function($)
{
    //$.mvc = MVC.Dispatcher;

    $.fn.mvc = function() {

        // instantate the console on top of the "this" jQuery element
        return new MVC.Dispatcher(this);

    };

})(jQuery);