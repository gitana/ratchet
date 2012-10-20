(function() {

    Ratchet.Utils.substituteTokens = function(link, tokens)
    {
        var text = link;

        for (var tokenId in tokens)
        {
            var tokenValue = tokens[tokenId];
            text = text.replace("{" + tokenId + "}", tokenValue);
        }

        return text;
    };

    Ratchet.blockingModal = null;
    Ratchet.block = function(title, message)
    {
        var setupModal = function(title, message)
        {
            // append wizard attributes
            $(Ratchet.blockingModal).find('.modal-title').html(title);
            $(Ratchet.blockingModal).find('.modal-body').html("<p align='center'><img src='/components/ratchet-web/please-wait.gif'></p><br/><p align='center'>" + message + "<br/><br/></p>");

            // launch modal
            $(Ratchet.blockingModal).modal();
        };

        if (!Ratchet.blockingModal)
        {
            // load modal template
            $.ajax({
                url: "components/ratchet-web/modal-block.html",
                success: function(modalHtml)
                {
                    // build modal dom
                    Ratchet.blockingModal = $(modalHtml);

                    setupModal(title, message);
                }
            });
        }
        else
        {
            Ratchet.unblock();
            setupModal(title, message);
        }
    };

    Ratchet.unblock = function()
    {
        if (Ratchet.blockingModal)
        {
            $(Ratchet.blockingModal).modal('hide');
        }
    };

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

    Ratchet.confirmDelete = function(title, body, onConfirm)
    {
        Ratchet.unblock();

        var div = null;

        // load modal template
        $.ajax({
            url: "components/ratchet-web/modal-confirm.html",
            success: function(modalHtml)
            {
                // build modal dom
                div = $(modalHtml);

                // launch modal
                $(div).modal();

                // append wizard attributes
                $(div).find('.modal-title').html(title);
                $(div).find('.modal-body').html("<p align='center'><br/>" + body + "<br/><br/></p>");
                $(div).find('.modal-footer').html("<button class='btn pull-left' data-dismiss='modal' aria-hidden='true'>Cancel</button><button class='btn btn-danger pull-right confirm-delete'>Delete</button>");

                $(div).find('.confirm-delete').click(function() {

                    $(div).modal('hide');

                    onConfirm();
                });

            }
        });
    };


})();