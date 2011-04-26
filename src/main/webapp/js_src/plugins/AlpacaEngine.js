(function($)
{
    Ratchet.AlpacaEngine = Base.extend(
    {
        constructor: function(id , connector)
        {
            this.base();

            this.id = id;

            this.connector = connector;
        },

        /**
         * Performs renditions using Alpaca engine.
         *
         * @param templateId
         */
        render: function(el, renditionOptions, model, successCallback, failureCallback)
        {
            var alpacaOptions = renditionOptions;

            if (model && model.data)
            {
                alpacaOptions.data = model.data;
            }

            if (this.connector != null)
            {
                alpacaOptions.connector = this.connector;
            }

            var postRender = alpacaOptions.postRender;

            alpacaOptions.postRender = function (renderedField) {

                if (postRender)
                {
                    postRender(renderedField);
                }

                if (successCallback)
                {
                    successCallback.call(successCallback, el)
                }
            };

            if (this.connector == null)
            {
                el.alpaca(alpacaOptions);
            }
            else
            {
                this.connector.connect(function (success) {
                    el.alpaca(alpacaOptions);
                },failureCallback);
            }
        }

    });

})(jQuery);