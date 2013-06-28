(function() {

    Ratchet.AbstractUIAction = Ratchet.AbstractAction.extend({

        constructor: function(actionId)
        {
            this.base(actionId);

            this.modalDiv = null;
            this.okayButtonTitle = "OK";

            this.showMessage = function(title, message, callback)
            {
                if (typeof(message) === "function")
                {
                    callback = message;
                    message = title;
                    title = null;
                }

                Ratchet.startModalConfirm(title, message, this.okayButtonTitle, null, function() {
                    callback();
                }, {
                    "cancel": false
                });
            };

            this.showModal = function(config, callback)
            {
                var self = this;

                if (typeof(config) === "function") {
                    callback = config;
                    config = {};
                }

                if (typeof(config) === "string") {
                    config = {
                        "title": config
                    };
                }

                this.hideModal(function() {

                    if (typeof(config.cancel) === "undefined")
                    {
                        config.cancel = false;
                    }

                    Ratchet.fadeModal(config, function(div, renderCallback) {

                        self.modalDiv = div;

                        callback(div, renderCallback);
                    });
                });
            };

            this.hideModal = function(callback)
            {
                if (!this.modalDiv)
                {
                    callback();
                    return;
                }

                $(this.modalDiv).modal('hide');
                $(this.modalDiv).on('hidden', function() {

                    this.modalDiv = null;

                    callback();
                });
            };
        }

    });

})();