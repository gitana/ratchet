(function($)
{
    Handlebars.registerHelper('times', function(n, block)
    {
        var accum = '';
        for(var i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    });
    var compare = function(lvalue, rvalue, options)
    {
        if (arguments.length < 3)
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

        var operator = options.hash.operator || "==";

        var operators = {
            '==':       function(l,r) { return l == r; },
            '===':      function(l,r) { return l === r; },
            '!=':       function(l,r) { return l != r; },
            '<':        function(l,r) { return l < r; },
            '>':        function(l,r) { return l > r; },
            '<=':       function(l,r) { return l <= r; },
            '>=':       function(l,r) { return l >= r; },
            'typeof':   function(l,r) { return typeof l == r; }
        };

        if (!operators[operator])
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

        return operators[operator](lvalue,rvalue);
    };
    Handlebars.registerHelper('compare', function(lvalue, rvalue, options)
    {
        var result = compare(lvalue, rvalue, options);
        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('greaterThan', function(lvalue, rvalue, options)
    {
        var result = compare(lvalue, rvalue, {
            "hash": {
                "operator": ">"
            }
        });
        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('greaterThanEqualTo', function(lvalue, rvalue, options)
    {
        var result = compare(lvalue, rvalue, {
            "hash": {
                "operator": ">="
            }
        });
        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('lessThan', function(lvalue, rvalue, options)
    {
        var result = compare(lvalue, rvalue, {
            "hash": {
                "operator": "<"
            }
        });
        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('lessThanEqualTo', function(lvalue, rvalue, options)
    {
        var result = compare(lvalue, rvalue, {
            "hash": {
                "operator": "<="
            }
        });
        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('exists', function(value, options)
    {
        if (value) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('ifnot', function(value, options)
    {
        if (!value) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('equalOrEmpty', function(value1, value2, options)
    {
        var result = false;

        if (!value1)
        {
            result = true;
        }
        else
        {
            result = (value1 == value2);
        }

        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('equal', function(value1, value2, options)
    {
        var result = (value1 == value2);

        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('setIndex', function(value){
        this.index = Number(value);
    });
    Handlebars.registerHelper("hasText", function(text, substr, options) {
        var result = (text.indexOf(substr) != -1);
        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Ratchet.HandlebarsTemplateEngine = Ratchet.BaseTemplateEngine.extend(
    {
        fileExtension: function() {
            return "html";
        },

        doRender: function(el, name, html, model, callback)
        {
            var template = null;

            //console.log("HTML: " + html);

            // compile
            try
            {
                template = Handlebars.compile(html);
            }
            catch (e)
            {
                callback(e);
            }

            // render template
            html = template(model);

            // fire callback
            if (callback) {
                callback(null, html);
            }
        }

    });

    // auto register
    Ratchet.TemplateEngineRegistry.register("handlebars", new Ratchet.HandlebarsTemplateEngine("handlebars"));

})(jQuery);