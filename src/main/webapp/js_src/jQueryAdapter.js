(function($)
{
    $.ratchet = Ratchet;

    $.fn.ratchet = function(func) {

        // instantate the console on top of the "this" jQuery element
        return new Ratchet(this[0], func);
    };

    /**
     * Used to convert a form into json
     */
    $.fn.serializeObject = function() {
        return window.form2object(this[0]);
    };

})(jQuery);