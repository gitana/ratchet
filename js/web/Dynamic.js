/*jshint -W014 */ // bad line breaking
/*jshint -W004 */ // duplicate variables
(function() {

    var MODAL_TEMPLATE = ' \
        <div class="modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="overflow: visible !important"> \
            <div class="modal-header"> \
                <h3 class="modal-title"></h3> \
            </div> \
            <div class="modal-body"></div> \
            <div class="modal-footer"></div> \
        </div> \
    ';

    Ratchet.defaultModalFadeClass = "fade";

    Ratchet.blockingModal = null;
    Ratchet.block = function(title, message, configOrAfterShownCallback)
    {
        if (Ratchet.blockingModal)
        {
            Ratchet.unblock(function() {
                Ratchet.block(title, message, config);
            });

            return;
        }

        var config = {};
        if (Ratchet.isFunction(configOrAfterShownCallback)) {
            config.afterShownCallback = configOrAfterShownCallback;
        }
        else if (Ratchet.isObject(configOrAfterShownCallback))
        {
            Ratchet.copyInto(config, configOrAfterShownCallback);
        }

        config.title = title;
        if (Ratchet.isUndefined(config.cancel)) {
            config.cancel = true;
        }
        if (Ratchet.isUndefined(config.footer)) {
            config.footer = false;
        }

        Ratchet.blockingModal = Ratchet.showModal(config, function(config) {
            return function(div, cb) {

                $(div).find('.modal-body').html("<div align='center'><div class='modal-please-wait'></div></div><br/><p align='center'>" + message + "<br/><br/></p>");

                cb(function() {

                    // after shown
                    if (config.afterShownCallback) {
                        config.afterShownCallback();
                    }
                });
            };
        }(config));

        return Ratchet.blockingModal;
    };

    Ratchet.unblock = function(configOrAfterHiddenCallback)
    {
        var config = {};
        if (Ratchet.isFunction(configOrAfterHiddenCallback)) {
            config.afterHiddenCallback = configOrAfterHiddenCallback;
        }
        else if (Ratchet.isObject(configOrAfterHiddenCallback))
        {
            Ratchet.copyInto(config, configOrAfterHiddenCallback);
        }

        if (Ratchet.blockingModal)
        {
            $(Ratchet.blockingModal).on('hidden', function(config) {
                return function() {
                    Ratchet.blockingModal = null;

                    if (config.afterHiddenCallback)
                    {
                        config.afterHiddenCallback();
                    }
                };
            }(config));
            $(Ratchet.blockingModal).modal('hide');
        }
        else
        {
            config.afterHiddenCallback();
        }
    };

    Ratchet.startModalGadget = function(options, overrides, beforeRatchetCallback, afterRatchetCallback)
    {
        var self = this;

        if (!options) {
            options = {};
        }
        if (Ratchet.isUndefined(options.cancel)) {
            options.cancel = true;
        }
        if (Ratchet.isUndefined(options.title)) {
            options.title = "Unknown Title";
        }
        if (Ratchet.isUndefined(options.completeButtonTitle)) {
            options.completeButtonTitle = "Done";
        }

        Ratchet.showModal(options, function(div, cb) {

            var gadgetType = options.type;
            var gadgetConfiguration = options.config;
            if (!gadgetConfiguration) {
                gadgetConfiguration = {};
            }

            var tempGadgetId = options.id;
            if (!tempGadgetId) {
                tempGadgetId = "gadget-" + new Date().getTime();
            }
            var tempGadgetType = "type-" + new Date().getTime();

            // create an instance of the gadget
            var dynamicGadget = null;
            if (Ratchet.DynamicGadgets) {
                dynamicGadget = Ratchet.DynamicGadgets[gadgetType];
            }
            if (dynamicGadget)
            {
                // instantiate - config is loaded by gadget on configure()
                (function(tempGadgetType, gadgetConfiguration, dynamicGadget) {

                    // using meta-programming, create instances of page controllers
                    Ratchet.GadgetRegistry.register(tempGadgetType, dynamicGadget.extend({

                        setup: function() {
                            this.get("/gadget/" + tempGadgetType, this.index);
                        },

                        configureDefault: function() {
                            this.base();

                            // push page configuration into config service
                            this.config(gadgetConfiguration);
                        }

                    }));

                }(tempGadgetType, gadgetConfiguration, dynamicGadget));
            }
            else
            {
                Ratchet.logError("Cannot start modal for unknown gadget type: " + gadgetType);
                return;
            }

            // attributes
            $(div).find(".modal-body").attr("gadget", tempGadgetType);
            $(div).find(".modal-body").attr("id", tempGadgetId);

            $(div).find('.modal-footer').append("<button class='btn pull-right complete-button' data-dismiss='modal' aria-hidden='true'>" + options.completeButtonTitle + "</button>");

             // ratchet it up
            var parentRatchet = $(div).ratchet(function() {

                this.parent = options.parent;

            });

            // ratchet for our gadget
            var ratchet = Ratchet.firstValueInObject(parentRatchet.childRatchets);

            // set up ratchet callback
            if (beforeRatchetCallback)
            {
                beforeRatchetCallback.call(self, div, ratchet);
            }

            // run the ratchet
            ratchet.run("/gadget/" + tempGadgetType);

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

            cb();

        });

    };

    /*
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
        Ratchet.startModalConfirm(title, body, "Delete", "btn-danger", function() {
            onConfirm();
        });
    };

    Ratchet.fadeModalConfirm = function(title, body, confirmButtonTitle, confirmButtonClass, onConfirm)
    {
        return Ratchet.startModalConfirm(title, body, confirmButtonTitle, confirmButtonClass, onConfirm, {
            "modalClass": Ratchet.defaultModalFadeClass
        });
    };

    Ratchet.startModalConfirm = function(title, body, confirmButtonTitle, confirmButtonClass, onConfirm, config)
    {
        if (!confirmButtonClass) {
            confirmButtonClass = "";
        }

        if (!config) {
            config = {};
        }

        if (typeof(config.title) === "undefined")
        {
            config.title = title;
        }
        if (typeof(config.cancel) === "undefined")
        {
            config.cancel = true;
        }

        Ratchet.showModal(config, function(div, cb) {

            $(div).find('.modal-body').html("<p align='center'><br/>" + body + "<br/><br/></p>");
            $(div).find('.modal-footer').append("<button class='btn pull-right confirm-button " + confirmButtonClass + "'>" + confirmButtonTitle + "</button>");

            $(div).find('.confirm-button').click(function() {

                $(div).on('hidden', function() {
                    onConfirm(div);
                });
                $(div).modal('hide');

            });

            cb();
        });
    };

    Ratchet.showModalMessage = function(title, message)
    {
        Ratchet.showModal({
            "title": title,
            "cancel": true
        }, function(div, cb) {
            $(div).find('.modal-body').html("<p align='center'><br/>" + message + "<br/><br/></p>");
            $(div).find('.modal-footer').append("<button class='btn pull-right' data-dismiss='modal' aria-hidden='true'>Okay</button>");

            cb();
        });
    };

    Ratchet.fadeModalMessage = function(title, message)
    {
        Ratchet.showModal({
            "title": title,
            "cancel": true,
            "modalClass": "fade"
        }, function(div, cb) {
            $(div).find('.modal-body').html("<p align='center'><br/>" + message + "<br/><br/></p>");
            $(div).find('.modal-footer').append("<button class='btn pull-right' data-dismiss='modal' aria-hidden='true'>Okay</button>");

            cb();
        });
    };

    Ratchet.fadeModal = function(config, setupFunction)
    {
        if (!config) {
            config = {};
        }

        if (!config.modalClass) {
            config.modalClass = Ratchet.defaultModalFadeClass;
        }

        return Ratchet.showModal(config, setupFunction);
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
        var div = $(MODAL_TEMPLATE.trim());

        if (config.modalClass) {
            $(div).addClass(config.modalClass);
        }

        var title = "";
        if (config.title)
        {
            title = config.title;
        }

        // set up title
        $(div).find('.modal-title').html(title);

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
            var t = $(div).modal({
                "keyboard": true
            });

            /*
            // vertical center
            $(div).on("shown", function() {
                $(div).css({
                    "margin-top": ($(div).outerHeight() / 2)
                });
            });
            */

            if (config.modalClass) {
                t.addClass(config.modalClass);
            }

        });

        return $(div);
    };

    // dynamic gadget types are stored here
    Ratchet.DynamicGadgets = {};
    Ratchet.DynamicRegistry = {
        register: function(type, classObject)
        {
            Ratchet.DynamicGadgets[type] = classObject;

            return classObject;
        }
    };

    // dashlet gadget types are stored here
    Ratchet.DashletGadgets = {};
    Ratchet.DashletRegistry = {
        register: function(type, classObject)
        {
            Ratchet.DashletGadgets[type] = classObject;

            return classObject;
        }
    };

})();