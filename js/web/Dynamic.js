(function() {

    var MODAL_TEMPLATE = ' \
			<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="overflow: visible !important"> \
		    	<div class="modal-header"> \
		        	<h3 class="modal-title"></h3> \
		    	</div> \
		    	<div class="modal-body"></div> \
		    <div class="modal-footer"></div> \
		</div> \
    ';

    Ratchet.blockingModal = null;
    Ratchet.block = function(title, message)
    {
        if (Ratchet.blockingModal)
        {
            Ratchet.unblock(function() {
                Ratchet.block(title, message);
            });

            return;
        }

        Ratchet.blockingModal = Ratchet.showModal({
            "title": title,
            "cancel": true,
            "footer": false
        }, function(div) {

            $(div).find('.modal-body').html("<p align='center'><img src='/components/ratchet/web/please-wait.gif'></p><br/><p align='center'>" + message + "<br/><br/></p>");
        });

        return Ratchet.blockingModal;
    };

    Ratchet.unblock = function(callback)
    {
        if (Ratchet.blockingModal)
        {
            $(Ratchet.blockingModal).modal('hide');
            $(Ratchet.blockingModal).on('shown', function() {
                Ratchet.blockingModal = null;

                if (callback)
                {
                    callback();
                }
            });
        }
    };

    /*
    Ratchet.startModalGadget = function(options, overrides, beforeRatchetCallback, afterRatchetCallback)
    {
        var self = this;

        // load modal template
        $.ajax({
            url: "components/ratchet-web/modal-gadget.html",
            success: function(modalHtml)
            {
                // build modal dom
                var div = $(modalHtml);

                // launch modal
                $(div).modal('show');

                // attributes
                $(div).attr("gadget", options.type);
                if (options.id)
                {
                    $(div).attr("id", options.id);
                }

                // ratchet it up
                var ratchet = $(div).ratchet(options.parent);

                // set up ratchet callback
                if (beforeRatchetCallback)
                {
                    beforeRatchetCallback.call(self, div, ratchet);
                }

                // run the ratchet
                ratchet.run(options.uri);

                if (overrides)
                {
                    // get back the gadget bound into the ratchet
                    for (var i = 0; i < ratchet.gadgetInstances.length; i++)
                    {
                        for (var k in overrides)
                        {
                            ratchet.gadgetInstances[i][k] = overrides[k];
                        }
                    }
                }

                // call any custom gadget callbacks (after ratchet callback)
                if (afterRatchetCallback)
                {
                    for (var i = 0; i < ratchet.gadgetInstances.length; i++)
                    {
                        afterRatchetCallback(div, ratchet, ratchet.gadgetInstances[i]);
                    }
                }
            }
        });
    };

    Ratchet.startModalWizard = function(parent, wizardId, uri, beforeRatchetCallback, afterRatchetCallback)
    {
        Ratchet.startModalGadget({
            "parent": parent,
            "type": "wizard",
            "id": wizardId,
            "uri": uri
        }, {
            "closeWizard": function()
            {
                $(this.ratchet().el).modal("hide");
            }
        }, function(div, ratchet) {

            // append wizard attributes
            $(div).find('.modal-title').addClass("wizard-title");
            $(div).find('.modal-body').addClass("wizard-body");
            $(div).find('.modal-footer').addClass("wizard-buttons");

            if (beforeRatchetCallback) {
                beforeRatchetCallback.call(this, div, ratchet);
            }

        }, function(div, ratchet, gadget) {

            if (afterRatchetCallback) {
                afterRatchetCallback.call(this, div, ratchet, gadget);
            }
        });
    };
    */

    Ratchet.confirmDelete = function(title, body, onConfirm)
    {
        Ratchet.showModal({
            "title": title,
            "cancel": true
        }, function(div) {

            $(div).find('.modal-body').html("<p align='center'><br/>" + body + "<br/><br/></p>");
            $(div).find('.modal-footer').append("<button class='btn pull-left' data-dismiss='modal' aria-hidden='true'>Cancel</button><button class='btn btn-danger pull-right confirm-delete'>Delete</button>");

            $(div).find('.confirm-delete').click(function() {

                $(div).modal('hide');

                onConfirm();
            });
        });
    };

    Ratchet.showModalMessage = function(title, message)
    {
        Ratchet.showModal({
            "title": title,
            "cancel": true
        }, function(div) {
            $(div).find('.modal-body').html("<p align='center'><br/>" + message + "<br/><br/></p>");
            $(div).find('.modal-footer').append("<button class='btn pull-right' data-dismiss='modal' aria-hidden='true'>Okay</button>");
        });
    };

    Ratchet.showModal = function(config, setupFunction)
    {
        var self = this;

        if (!config) {
            config = {};
        }

        //Ratchet.unblock();

        if (!setupFunction)
        {
            setupFunction = function(div, callback) {
                callback(null);
            };
        }

        // build modal dom
        var div = $(MODAL_TEMPLATE);

        var title = "";
        if (config.title)
        {
            title = config.title;
        }

        // set up title
        $(div).find('.modal-title').html(config.title);

        // set up footer
        $(div).find('.modal-footer').html("");

        // auto-add cancel button
        if (config.cancel)
        {
            $(div).find('.modal-footer').append("<button class='btn pull-left' data-dismiss='modal' aria-hidden='true'>Cancel</button>");
        }

        if (typeof(config.footer) === "undefined") {
            config.footer = true;
        }

        if (!config.footer)
        {
            $(div).find(".modal-footer").remove();
        }

        // set up modal
        setupFunction.call(self, div, function(afterShownCallback) {

            if (afterShownCallback) {
                $(div).on("shown", function() {
                    afterShownCallback();
                });
            }

            // launch modal
            $(div).modal({
                "keyboard": true
            });

        });

        return $(div);
    };

})();