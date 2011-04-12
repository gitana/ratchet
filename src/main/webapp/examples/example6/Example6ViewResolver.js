(function($)
{
    Example6ViewResolver = Ratchet.ViewResolver.extend(
    {
        constructor: function(dispatcher)
        {
            this.base(dispatcher);
        },

        /**
         * @override
         */
        registerMappings: function()
        {
            this.register("index", this.index);
        },

        index: function(modelAndView)
        {
            // TODO:
            // TODO: all of this logic needs to exist OOTB for any template as a post-render
            // TODO:

            var _this = this;
            $("[gadget]").each(function() {

                var gadgetId = $(this).attr("gadget");

                // get the gadget instance from the dispatcher
                var gadget = _this.getDispatcher().instantiateGadget(gadgetId, this);
                if (gadget)
                {
                    gadget.setup(modelAndView);

                    gadget.render();

                    // remove the special "gadget" attribute
                    $(this).attr("gadget", "");
                }
                else
                {
                    _this.error("Missing gadget: " + gadgetId);
                }
            });
        }

    });

    Ratchet.ViewResolverRegistry.register("example6", Example6ViewResolver);

})(jQuery);