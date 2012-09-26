(function($)
{
    Component = Ratchet.Gadget.extend(
    {
        constructor: function(id, ratchet)
        {
            this.base(id, ratchet);
            var val = $(this.ratchet().el).attr('subscription');
            this.subscription = val ? val : id;
        },

        setup: function()
        {
            this.get(this.index);
        },

        refresh: function()
        {
            this.run("/");
        },
        
        index: function(el)
        {
  
            // detect changes to the pairs and redraw when they occur
            this.subscribe(this.subscription, this.refresh);

            var model = el.model;

            model["component"] = this.observable(this.subscription).get();
            
            el.transform("templates/component", function() {
                el.swap();
            });
        }
    });

    Ratchet.GadgetRegistry.register("component", Component);

})(jQuery);