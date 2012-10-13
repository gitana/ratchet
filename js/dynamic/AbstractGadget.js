(function($) {
    Ratchet.AbstractGadget = Ratchet.Gadget.extend({

        constructor: function(type, ratchet, id) {
            this.base(type, ratchet, id);
            //var val = $(this.ratchet().el).attr('subscription');
            //this.subscription = val ? val : type;

            this.subscription = "gadget_" + type + "_" + id;
        },

        /*
        setup: function() {
            this.get(this.index);
        },
        */

        /*
        refresh: function(link) {
            var self = this;
            var defaultURL = this.DEFAULT_URL ? this.DEFAULT_URL : "/";
            var refreshLink = link ? link : defaultURL;
            self.run(refreshLink);
        },
        */

        _observable : function (key, args, defaultVal) {
            var _args = Ratchet.makeArray(args);
            if (_args.length > 0) {
                if (typeof _args[0] == "string") {
                    key = _args.shift();
                    if (_args.length > 0) {
                        this.observable(key).set(_args.shift());
                    }
                }
                else {
                    this.observable(key).set(_args.shift());
                }
            }
            var val = this.observable(key).get();
            if (val == null && defaultVal != null) {
                val = defaultVal;
                this.observable(key).set(defaultVal);
            }
            return val;
        },

        _clearObservable: function(key, defaultKey) {
            var _key = key ? key : defaultKey;
            this.observable(_key).clear();
        },

        /*
        model: function(el) {
            if (!el.model[this.id]) {
                el.model[this.id] = this.observable(this.subscription).get();
            }

            return el.model[this.id];
        },
        */

        renderTemplate: function(el, templatePath, data, callback) {

            if (templatePath.indexOf('/') != 0) {
                var prefix = "app";
                templatePath = prefix + "/" + templatePath;
            }

            if (data && callback) {
                el.transform(templatePath, data, function(el) {
                    callback(el);
                });
            } else {
                callback = data;
                el.transform(templatePath, function(el) {
                    callback(el);
                });
            }
        }

    });

})(jQuery);