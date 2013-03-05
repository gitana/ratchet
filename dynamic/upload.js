define(function(require, exports, module) {

    require("css!ratchet/dynamic/common.css");

    require("css!ratchet/dynamic/upload.css");
    var html = require("text!ratchet/dynamic/upload.html");
    var Ratchet = require("ratchet/web");

    require("ratchet/tmpl");
    require("bootstrap");

    /*require("jquery.ui.widget");*/
    require("jquery-fileupload/js/jquery.iframe-transport");
    require("jquery-fileupload/js/jquery.fileupload");
    require("jquery-fileupload/js/jquery.fileupload-fp");
    require("jquery-fileupload/js/jquery.fileupload-ui");
    require("css!jquery-fileupload/css/jquery.fileupload-ui.css");

    var tmpl = require("tmpl");

    return Ratchet.DynamicRegistry.register("upload", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,
		
	    afterSwap: function(el, config, originalContext)
	    {
	        var self = this;

            // defaults
            if (!config.method) {
                config.method = "post";
            }
            if (!config.url) {
                alert("URL is required");
            }

            // build config
	        var fileUploadConfig = {
                "dataType": "json",
                "method": config.method,
                "url": config.url,
                "uploadTemplateId": null,
                "uploadTemplate": tmpl($(el).find("#template-upload").html()),
                "downloadTemplateId": null,
                "downloadTemplate": tmpl($(el).find("#template-download").html()),
                "filesContainer": $(el).find(".files"),
                "dropZone": $(el).find(".upload-dropzone")
            };

            // optional config
            if (!Ratchet.isUndefined(config.maxFileSize)) {
	            fileUploadConfig.maxFileSize = config.maxFileSize;
	        }
            if (!Ratchet.isUndefined(config.maxNumberOfFiles)) {
	            fileUploadConfig.maxNumberOfFiles = config.maxNumberOfFiles;
	        }
            if (!Ratchet.isUndefined(config.autoUpload)) {
                fileUploadConfig.autoUpload = config.autoUpload;
            }

	        //if (config.filetypes)
	        //{
	            //fileUploadConfig.acceptFileTypes = /(\.|\/)(gif|jpe?g|png)$/i;
	        //}

	        // bind control
	        var fileUpload = $(el).find('.fileupload-form').fileupload(fileUploadConfig);
            this.fileUpload = fileUpload;

            /////////////////////////////////////////////////////////////////////////////////////////
	        //
	        // CORE CALLBACKS FOR FILEUPLOAD
	        //
	        /////////////////////////////////////////////////////////////////////////////////////////

	        fileUpload.bind("fileuploadcustombeforesend", function(e, data) {
	            self.onCustomBeforeSend.call(self, e, data, this, config);
	        });
	        fileUpload.bind("fileuploadadd", function(e, data) {
	            self.onAdd.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploadsubmit", function(e, data) {
	            self.onSubmit.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploadsend", function(e, data) {
	            self.onSend.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploaddone", function(e, data) {
	            self.onDone.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploadfail", function(e, data) {
	            self.onFail.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploadalways", function(e, data) {
	            self.onAlways.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploadprogress", function(e, data) {
	            self.onProgress.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploadprogressall", function(e, data) {
	            self.onProgressAll.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploadstart", function(e, data) {
	            self.onStart.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploadstop", function(e, data) {
	            self.onStop.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploadchange", function(e, data) {
	            self.onChange.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploadpaste", function(e, data) {
	            self.onPaste.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploaddrop", function(e, data) {
	            self.onDrop.call(self, e, data, this, config);
	        });

	        fileUpload.bind("fileuploaddragover", function(e, data) {
	            self.onDragover.call(self, e, data, this, config);
	        });

            /// drop zone
            $(document).bind('dragover', function (e) {
                var dropZone = $('.upload-dropzone'),
                    timeout = window.dropZoneTimeout;
                if (!timeout) {
                    dropZone.addClass('in');
                } else {
                    clearTimeout(timeout);
                }
                if (e.target === dropZone[0]) {
                    dropZone.addClass('hover');
                } else {
                    dropZone.removeClass('hover');
                }
                window.dropZoneTimeout = setTimeout(function () {
                    window.dropZoneTimeout = null;
                    dropZone.removeClass('in hover');
                }, 100);
            });
	    },

	    /**
	     * Attach any additional properties or pass multi-part parameters to the upload handler.
	     *
	     * @param e
	     * @param data
	     * @param domEl
	     * @param ratchet
	     */
	    onCustomBeforeSend: function(e, data, domEl, model)
	    {
	        // clean out and mix any new hidden fields for all of the files being transmitted
	        $(domEl).find('.custom-send-field').remove();
	        $(domEl).find("input:hidden").remove();
	        $.each(data.files, function(index, file)
	        {
                /**
                 * Properties are content metadata properties to be attached to each node.
                 */
	            if (model["properties"])
	            {
	                for (var propertyName in model["properties"])
	                {
	                    var propertyValue = model["properties"][propertyName];

	                    $(domEl).append('<input class="custom-send-field" type="hidden" name="property' + index + '__' + propertyName + '" value="' + propertyValue + '">');
	                }
	            }

                if (model["params"])
                {
                    for (var paramName in model["params"])
                    {
                        var paramValue = model["params"][paramName];

                        $(domEl).append('<input class="custom-send-field" type="hidden" name="param' + index + '__' + paramName + '" value="' + paramValue + '">');
                    }
                }
	        });

	        var thisContext = [];
	        $.each(data.context, function(index, elem)
	        {
	            if ($(elem).hasClass('template-upload'))
	            {
	                thisContext.push(elem);
	            }
	            else
	            {
	                $(elem).remove();
	            }
	        });

	        data.context = $(thisContext);
	    },

	    // Callback for the submit event of each file add:
	    onAdd: function(e, data, domEl, model)
	    {
	    },

	    // Callback for the submit event of each file upload:
	    onSubmit: function(e, data, domEl, model)
	    {
	    },

	    // Callback for the start of each file upload request:
	    onSend: function(e, data, domEl, model)
	    {
	    },

	    // Callback for successful uploads:
	    onDone: function(e, data, domEl, model)
	    {
	    },

	    // Callback for failed (abort or error) uploads:
	    onFail: function(e, data, domEl, model)
	    {
	    },

	    // Callback for completed (success, abort or error) requests:
	    onAlways: function(e, data, domEl, model)
	    {
	    },

	    // Callback for upload progress events:
	    onProgress: function(e, data, domEl, model)
	    {
	    },

	    // Callback for global upload progress events:
	    onProgressAll: function(e, data, domEl, model)
	    {
	    },

	    // Callback for uploads start, equivalent to the global ajaxStart event:
	    onStart: function(e, data, domEl, model)
	    {
	    },

	    // Callback for uploads stop, equivalent to the global ajaxStop event:
	    onStop: function(e, data, domEl, model)
	    {
	    },

	    // Callback for change events of the fileInput(s):
	    onChange: function(e, data, domEl, model)
	    {
	    },

	    // Callback for paste events to the pasteZone(s):
	    onPaste: function(e, data, domEl, model)
	    {
	    },

	    // Callback for drop events of the dropZone(s):
	    onDrop: function(e, data, domEl, model)
	    {
	    },

	    // Callback for dragover events of the dropZone(s):
	    onDragover: function(e, data, domEl, model)
	    {
	    }

	}));
});

