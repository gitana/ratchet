define(function(require, exports, module) {

    require("css!ratchet/gadgets/common.css");

    var html = require("text!ratchet/gadgets/wizard.html");
    var Ratchet = require("ratchet/web");

    require("ratchet/tmpl");
    require("bootstrap");

    require("ratchet/gadgets/wizard-sidebar");

    return Ratchet.DynamicRegistry.register("wizard", Ratchet.AbstractDynamicGadget.extend({

		TEMPLATE: html,
	
	    _state: {},

	    pageId: function(p)
	    {
	        var self = this;

	        if (p)
	        {
	            self.observable("wizardPageId").set(p);
	        }

	        var p2 = null;
	        if (self.observable("wizardPageId").get())
	        {
	            p2 = self.observable("wizardPageId").get();
	        }

	        return p2;
	    },

	    state: function(model)
	    {
	        var self = this;

	        if (model)
	        {
	            for (var k in model)
	            {
	                self._state[k] = model[k];
	            }
	        }

	        return self._state;
	    },

	    prepareModel: function(el, config, callback)
	    {
            var self = this;

            this.base(el, config, function() {

                self.doPrepareModel.call(self, el, config, callback);

                callback();
            });

        },

        doPrepareModel: function(el, config, callback)
        {
	        var self = this;

	        var currentPageId = self.pageId();
	        if (!currentPageId)
	        {
	            currentPageId = config.start;
	        }

	        var page = config.pages[currentPageId];
	        if (!page)
	        {
	            console.log("Cannot find page: " + currentPageId);
	        }
	        else
	        {
	            var current = {};
	            current.title = this.substituteTokens(page.title);
	            if (!current.title)
	            {
	                current.title = "Unknown Page Title";
	            }

	            var stateMapper = function() { };

	            var part1 = function(cb)
	            {
	                // HANDLE PAGE TYPE
	                var type = page.type;
	                if (type == "form")
	                {
	                    // FORM
	                    var f = {};
	                    f.schema = page.schema;
	                    f.data = {};
	                    for (var p in f.schema.properties)
	                    {
	                        f.data[p] = self.state()[p];
	                    }
	                    f.options = page.options;
	                    f.postRender = function(control)
	                    {
	                        stateMapper = function()
	                        {
	                            self.state(control.getValue());
	                        };
	                        cb();
	                    };
	                    current.body = $("<div></div>");
                    	$(current.body).alpaca(f);							
	                }
	                else if (type == "html")
	                {
	                    current.body = $("<div></div>");
	                    $(current.body).html(page.html);

	                    cb();
	                }
	                else
	                {
	                    alert('bad wizard page type: ' + type);
	                }
	            };

	            var part2 = function(cb)
	            {
	                // BUTTONS
	                current.buttons = $("<div></div>");
	                for (var buttonKey in page.buttons)
	                {
	                    var b = page.buttons[buttonKey];



	                    ///////////////////////////////////////////////////////////////
	                    // TITLE
	                    ///////////////////////////////////////////////////////////////

	                    var title = null;
	                    if (b.type == "cancel")
	                    {
	                        title = "Cancel";
	                    }
	                    else if (b.type == "prev" || b.type == "previous")
	                    {
	                        title = "Previous";
	                    }
	                    else if (b.type == "next")
	                    {
	                        title = "Next";
	                    }
	                    else if (b.type == "finish")
	                    {
	                        title = "Finish";
	                    }
	                    if (b.title)
	                    {
	                        title = b.title;
	                    }


	                    var buttonClass = null;
	                    if (b.primary)
	                    {
	                        buttonClass = "btn-primary";
	                    }
	                    if (b.kind)
	                    {
	                        buttonClass = "btn-" + b.kind;
	                    }


	                    ///////////////////////////////////////////////////////////////
	                    // BUILD THE BUTTON
	                    ///////////////////////////////////////////////////////////////

	                    var button = $("<button class='btn'>" + title + "</button>");
	                    if (buttonClass)
	                    {
	                        button.addClass(buttonClass);
	                    }
	                    if (b.type == "cancel")
	                    {
	                        button.addClass("pull-left");
	                    }


	                    ///////////////////////////////////////////////////////////////
	                    // CLICK HANDLER
	                    ///////////////////////////////////////////////////////////////

	                    // bind click handlers
	                    if (b.type == "cancel")
	                    {
	                        (function(b, button) {
	                            button.click(function() {
	                                self.onCancelWizard.call(self, function() {
	                                    self.closeWizard();
	                                });
	                            });
	                        }(b, button));
	                    }
	                    else if (b.type == "prev" || b.type == "previous" || b.type == "next")
	                    {
	                        (function(b, button, stateMapper) {
	                            button.click(function() {
	                                stateMapper();
	                                self.pageId(b.target);
	                                self.index(el);
	                            });
	                        }(b, button, stateMapper));
	                    }
	                    else if (b.type == "finish")
	                    {
	                        (function(b, button, stateMapper) {
	                            button.click(function() {
	                                stateMapper();
	                                self.onFinishWizard.call(self, self.state(), function() {
	                                    self.closeWizard.call(self);
	                                });
	                            });
	                        }(b, button, stateMapper));
	                    }

	                    current.buttons.append(button);
	                }

	                config.current = current;

	                cb();
	            };

	            part1(function() {
	                part2(function() {
	                    callback();
	                });
	            });
	        }
	    },

	    render: function(el, model, callback)
	    {
	        var self = this;

	        if ($(self.ratchet().el).html().trim().length == 0)
	        {
	            self.renderTemplate(el, self.TEMPLATE, model, function(el) {
	                callback(el);
	            });
	        }
	        else
	        {
	            $(el).html($(self.ratchet().el).html());

	            callback(el);
	        }
	    },

	    afterSwap: function(el, model)
	    {
	        $(el).find(".wizard-title").html("");
	        $(el).find(".wizard-title").append(model.current.title);

	        $(el).find(".wizard-body").html("");
	        $(el).find(".wizard-body").append(model.current.body);

	        $(el).find(".wizard-buttons").html("");
	        $(el).find(".wizard-buttons").append(model.current.buttons);

	        // auto focus the first input we find in the modal
	        // TODO: for some reason, this doesn't work?
	        // TODO: hack, using a timeout...
	        window.setTimeout(function() {
	            $(el).find('input').focus();
	        }, 250);

	    },

	    onCancelWizard: function(callback)
	    {
	        callback();
	    },

	    onFinishWizard: function(data, callback)
	    {
	        callback();
	    },

	    closeWizard: function()
	    {
	    },
	
		substituteTokens: function(text)
		{
			var self = this;

			var i = -1;
			do
			{
				i = text.indexOf("${");
				if (i > -1)
				{
					var j = text.indexOf("}", i);
					
					var key = text.substring(i+2, j);
					var value = self.state()[key];
					
					text = text.substring(0, i) + value + text.substring(j+1);
				}
			}
			while (i > -1);
			
			return text;
		}
	}));

});
