define(function(require, exports, module) {

    require("ratchet/dynamic/common.css");

    require("ratchet/dynamic/dropzone.css");
    var html = require("ratchet/dynamic/dropzone.html");
    var Ratchet = require("ratchet/web");

    require("dropzone");

    return Ratchet.DynamicRegistry.register("dropzone", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,
		
	    afterSwap: function(el, model, originalContext)
	    {
            var config = {
                "url": model.url,
                "parallelUploads": 2,
                "maxFilesize": 256, // mb
                "paramName": "file",
                "createImageThumbnails": true,
                "maxThumbnailFilesize": 2,
                "thumbnailWidth": 100,
                "thumbnailHeight": 100,
                "params": {},
                "clickable": true,
                "enqueueForUpload": true,
                "previewsContainer": null
            };

            $(el).find(".dzholder").dropzone(config);
	    }

	}));
});

