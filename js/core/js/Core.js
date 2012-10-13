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
            $(Ratchet.blockingModal).find('.modal-body').html("<p align='center'><img src='./ratchet/core/images/please-wait.gif'></p><br/><p align='center'>" + message + "<br/><br/></p>");

            // launch modal
            $(Ratchet.blockingModal).modal();
        };

        if (!Ratchet.blockingModal)
        {
            // load modal template
            $.ajax({
                url: "/ratchet/core/templates/modal-block.html",
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

    Ratchet.startModalGadget = function(options, overrides, postSetup)
    {
        var self = this;

        // load modal template
        $.ajax({
            url: "/ratchet/core/templates/modal-gadget.html",
            success: function(modalHtml)
            {
                // build modal dom
                var div = $(modalHtml);

                // any post setup
                if (postSetup)
                {
                    postSetup.call(self, div);
                }

                // launch modal
                $(div).modal();

                // attributes
                $(div).attr("gadget", options.type);
                if (options.id)
                {
                    $(div).attr("id", options.id);
                }

                // ratchet it up
                var r = $(div).ratchet(options.parent);
                r.run(options.uri);

                if (overrides)
                {
                    // get back the gadget bound into the ratchet
                    for (var i = 0; i < r.gadgetInstances.length; i++)
                    {
                        for (var k in overrides)
                        {
                            r.gadgetInstances[i][k] = overrides[k];
                        }
                    }
                }

            }
        });
    };

    Ratchet.startModalWizard = function(parent, wizardId, uri)
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
        }, function(div) {

            // append wizard attributes
            $(div).find('.modal-title').addClass("wizard-title");
            $(div).find('.modal-body').addClass("wizard-body");
            $(div).find('.modal-footer').addClass("wizard-buttons");

        });
    };

    Ratchet.confirmDelete = function(title, body, onConfirm)
    {
        Ratchet.unblock();

        var div = null;

        // load modal template
        $.ajax({
            url: "/ratchet/core/templates/modal-confirm.html",
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