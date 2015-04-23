/*jshint -W014 */ // bad line breaking
/*jshint -W004 */ // duplicate variables
(function() {

    /*
    var MODAL_TEMPLATE = ' \
        <div class="modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="overflow: visible !important"> \
            <div class="modal-dialog"> \
                <div class="modal-content"> \
                    <div class="modal-header"> \
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                        <h4 class="modal-title"></h4> \
                    </div> \
                    <div class="modal-body"></div> \
                    <div class="modal-footer"></div> \
                </div> \
            </div> \
        </div> \
    ';
    */

    var MODAL_TEMPLATE = ' \
        <div class="modal" tabindex="-1" data-width="760" style="display:none"> \
            <div class="modal-header"> \
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                <h4 class="modal-title"></h4> \
            </div> \
            <div class="modal-body"></div> \
            <div class="modal-footer"></div> \
        </div> \
    ';

    Ratchet.blockingModal = null;
    Ratchet.block = function(title, message, configOrAfterShownCallback)
    {
        var config = {};
        if (Ratchet.isFunction(configOrAfterShownCallback)) {
            config.afterShownCallback = configOrAfterShownCallback;
        }
        else if (Ratchet.isObject(configOrAfterShownCallback))
        {
            Ratchet.copyInto(config, configOrAfterShownCallback);
        }

        // if already blocking, then first unblock
        if (Ratchet.blockingModal)
        {
            Ratchet.unblock(function() {
                Ratchet.block(title, message, config);
            });

            return;
        }

        config.title = title;
        if (Ratchet.isUndefined(config.cancel)) {
            config.cancel = true;
        }
        if (Ratchet.isUndefined(config.footer)) {
            config.footer = false;
        }

        Ratchet.showModal(config, function(config) {
            return function(div, cb) {

                $(div).find('.modal-body').html("<div align='center'><div class='modal-please-wait'></div></div><br/><p align='center'>" + message + "<br/><br/></p>");

                cb(function() {

                    // if they click the "close" button, wipe down the Ratchet.blockingModal
                    $(div).find(".close").click(function() {
                        Ratchet.blockingModal = null;
                    });

                    // start the spinner
                    Ratchet.spin($(div).find(".modal-please-wait"));

                    // store div
                    Ratchet.blockingModal = $(div);

                    // after shown
                    if (config.afterShownCallback) {
                        config.afterShownCallback();
                    }
                });
            };
        }(config));
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
            var rb = Ratchet.blockingModal;
            Ratchet.blockingModal = null;

            $(rb).on('hidden.bs.modal', function(config) {
                return function() {

                    if (config.afterHiddenCallback)
                    {
                        config.afterHiddenCallback();
                    }
                };
            }(config));
            $(rb).modal('hide');
        }
        else
        {
            if (config.afterHiddenCallback)
            {
                config.afterHiddenCallback();
            }
        }
    };

    /*
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

            var matches = Ratchet.GadgetRegistry.list(gadgetType);
            if (matches && matches.length > 0) {
                dynamicGadget = matches[0];
            }
            if (!dynamicGadget && Ratchet.DynamicGadgets) {
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

            $(div).find('.modal-footer').append("<button class='btn btn-default pull-right complete-button' data-dismiss='modal' aria-hidden='true'>" + options.completeButtonTitle + "</button>");

            // ratchet it up
            var ratchet = new Ratchet($(div).find(".modal-body")[0], options.parent, function() {
            });

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

    Ratchet.startModalConfirm = function(title, body, confirmButtonTitle, confirmButtonClass, onConfirm, config, configCallback)
    {
        if (!confirmButtonClass) {
            confirmButtonClass = "btn-default";
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

            var bodyHtml = "<p align='center'><br/>" + body + "<br/><br/></p>";
            if (body && body.toLowerCase().indexOf("<p") == 0)
            {
                bodyHtml = body;
            }

            $(div).find('.modal-body').html(bodyHtml);
            $(div).find('.modal-footer').append("<button class='btn pull-right confirm-button " + confirmButtonClass + "'>" + confirmButtonTitle + "</button>");

            $(div).find('.confirm-button').click(function() {

                $(div).on('hidden.bs.modal', function() {
                    onConfirm(div);
                });
                $(div).modal('hide');

            });

            if (configCallback)
            {
                configCallback(div);
            }

            cb();
        });
    };

    Ratchet.showModalMessage = function(title, message)
    {
        Ratchet.showModal({
            "title": title,
            "cancel": false
        }, function(div, cb) {
            $(div).find('.modal-body').html("<p align='center'><br/>" + message + "<br/><br/></p>");
            $(div).find('.modal-footer').append("<button class='btn btn-default pull-right' data-dismiss='modal' aria-hidden='true'>Okay</button>");

            cb();
        });
    };

    Ratchet.fadeModalMessage = function(title, message)
    {
        Ratchet.showModal({
            "title": title,
            "cancel": false,
            "modalClass": Ratchet.defaultModalFadeClass
        }, function(div, cb) {
            $(div).find('.modal-body').html("<p align='center'><br/>" + message + "<br/><br/></p>");
            $(div).find('.modal-footer').append("<button class='btn btn-default pull-right' data-dismiss='modal' aria-hidden='true'>Okay</button>");

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

        if (typeof(config.close) == "undefined") {
            config.close = true;
        }

        // set up title
        $(div).find('.modal-title').html(title);

        // set up footer
        $(div).find('.modal-footer').html("");

        if (config.body)
        {
            $(div).find(".modal-body").empty();
            $(div).find(".modal-body").append(config.body);
        }

        // auto-add cancel button
        if (config.cancel)
        {
            var cancelButton = $("<button class='btn btn-default pull-left' data-dismiss='modal' aria-hidden='true'>Cancel</button>");
            $(div).find('.modal-footer').append(cancelButton);
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

            if (afterShownCallback)
            {
                $(div).on("shown.bs.modal", function() {
                    afterShownCallback();
                });
            }

            if (!config.close)
            {
                $(div).find(".close").css("display", "none");
            }

            // launch modal
            var t = $(div).modal({
                "keyboard": (config.cancel ? true : false)
            });

            if (config.modalClass)
            {
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

    Ratchet.spin = function(el)
    {
        var opts = {
            lines: 12,            // The number of lines to draw
            length: 7,            // The length of each line
            width: 5,             // The line thickness
            radius: 10,           // The radius of the inner circle
            rotate: 0,            // Rotation offset
            corners: 1,           // Roundness (0..1)
            color: '#000',        // #rgb or #rrggbb
            direction: 1,         // 1: clockwise, -1: counterclockwise
            speed: 1,             // Rounds per second
            trail: 100,           // Afterglow percentage
            opacity: 1/4,         // Opacity of the lines
            fps: 20,              // Frames per second when using setTimeout()
            zIndex: 2e9,          // Use a high z-index by default
            className: 'spinner', // CSS class to assign to the element
            top: 'auto',          // center vertically
            left: 'auto',         // center horizontally
            position: 'relative'  // element position
        };

        $(el).spin(opts);
    };

    /**
     * Pops up a modal dialog with a picker in it.
     *
     * Config:
     *
     *      {
     *          "title": "",
     *          "pickTitle": "",
     *
     *          "picker": {
     *              "type": "<pickerType>",
     *              ... config
     *          }
     *      }
     *
     * @param config
     */
    Ratchet.showPicker = function(config, onPickFn)
    {
        if (!config) {
            config = {};
        }
        if (!config.title) {
            config.title = "Pick Something";
        }
        if (!config.pickTitle) {
            config.pickTitle = "Pick";
        }

        // required: config.type (gadget type)
        if (!config.type) {
            throw new Error("You must supply config.type");
        }

        // generate a new picker gadget to handle this picker
        var pickerType = config.type;
        var pickerId = "picker-" + new Date().getTime();
        var pickerConfig = {};
        if (config.picker) {
            pickerConfig = config.picker;
        }
        var gadget = Ratchet.instantiateGadget(pickerType, pickerId, pickerConfig);

        // pickers rely on "context" method to provide environment variables used for looking things up
        if (config.context) {
            gadget.prototype.context = function() {
                return config.context;
            };
        }

        var picker = $('<div gadget="' + pickerType + '" id="' + pickerId + '"></div>');
        picker.css("display", "none");
        $(document.body).append(picker);

        // ratchet it up
        var currentHash = window.location.hash;
        var parentRatchet = null;
        if (config.el)
        {
            parentRatchet = Ratchet.findClosestBoundRatchet(config.el);
        }
        var ratchet = new Ratchet(picker, parentRatchet, function() {});
        ratchet.run(currentHash);

        window.setTimeout(function() {

            // modal dialog
            Ratchet.fadeModal({
                "title": config.title,
                "cancel": true
            }, function(div, renderCallback) {

                // append the "Pick" button
                $(div).find('.modal-footer').append("<button class='btn btn-primary pull-right pick' disabled='disabled'>" + config.pickTitle + "</button>");

                // body
                $(div).find(".modal-body").html("");
                var b = $(div).find(".modal-body");
                b.addClass("picker");
                picker.css("display", "block");
                b.append(picker);


                // override the "onPickItems" method so that we can listen to when things are selected
                // and store the ids back here
                var pickedItems = [];
                gadget.prototype.onPickItems = function(items)
                {
                    pickedItems = items;

                    if (pickedItems && pickedItems.length > 0)
                    {
                        // enable
                        $(div).find('.pick').prop("disabled", false);
                    }
                    else
                    {
                        // disable
                        $(div).find('.pick').prop("disabled", true);
                    }
                };

                // pick button
                $(div).find('.pick').click(function() {

                    $(div).modal('hide');
                    $(div).on('hidden.bs.modal', function() {

                        if (onPickFn)
                        {
                            onPickFn(pickedItems);
                        }
                    });
                });

                // if closed for any other reason
                $(div).on("hide.bs.modal", function() {

                    // destroy ratchet
                    ratchet.teardown();

                    // unregister the gadget that we dynamically instantiated
                    Ratchet.GadgetRegistry.deregister(pickerType, pickerId);
                });


                renderCallback(function() {
                });
            });

        }, 500);
    };

    Ratchet.instantiateGadget = function(gadgetTypeId, gadgetId, gadgetConfig)
    {
        if (!gadgetConfig) {
            gadgetConfig = {};
        }

        // create an instance of the gadget
        var dynamicGadget = null;

        var matches = Ratchet.GadgetRegistry.list(gadgetTypeId);
        if (matches && matches.length > 0) {
            dynamicGadget = matches[0];
        }
        if (!dynamicGadget && Ratchet.DynamicGadgets) {
            dynamicGadget = Ratchet.DynamicGadgets[gadgetTypeId];
        }

        if (!dynamicGadget)
        {
            throw new Error("Cannot find dynamic gadget type: " + gadgetTypeId);
        }

        // factory function for our new gadget
        var newGadgetType = (function(gadgetTypeId, gadgetId, gadgetConfig, dynamicGadget) {

            // using meta-programming, create instances of gadget controllers
            // config is loaded by gadget on configure()
            return dynamicGadget.extend({

                setup: function() {
                    this.get(this.index);
                },

                configureDefault: function() {

                    this.base();

                    // push page configuration into config service
                    this.config(gadgetConfig);
                }

            });

        }(gadgetTypeId, gadgetId, gadgetConfig, dynamicGadget));

        return Ratchet.GadgetRegistry.register(gadgetTypeId, gadgetId, newGadgetType);
    };

})();