(function($) {

    /**
     * Helper class for retrieving messages from Configuration for a given locale.
     *
     * @type {*}
     */
    var messagesClass = Base.extend({

        DEFAULT_LOCALE: "en_US",

        /**
         * Retrieves the messages for a given locale key.
         *
         * @param locale
         * @param configurationService (optional)
         */
        messages: function(locale, configurationService)
        {
            if (!configurationService) {
                configurationService = Ratchet.Configuration;
            }

            var config = {};

            if (locale)
            {
                // see if we have an exact locale match
                var exactMatches = configurationService.evaluate({"locale": locale});
                if (exactMatches && exactMatches.messages)
                {
                    Ratchet.merge(exactMatches, config);
                    return config.messages;
                }

                // otherwise, see if we have partial match by language
                var x = locale.indexOf("_");
                if (x > -1)
                {
                    var language = locale.substring(0,x);
                    var languageMatches = configurationService.evaluate({"locale": language});
                    if (languageMatches && languageMatches.messages)
                    {
                        Ratchet.merge(languageMatches, config);
                        return config.messages;
                    }
                }
            }

            // otherwise either a locale wasn't specified or we couldn't find a match
            // either way, hand back the default locale matches

            var defaultMatches = configurationService.evaluate({"locale": this.DEFAULT_LOCALE});
            if (defaultMatches && defaultMatches.messages)
            {
                Ratchet.merge(defaultMatches, config);
            }

            return config.messages;
        },

        /**
         * Retrieves the helper accessor into the messages service using the given locale.
         *
         * @param locale
         * @param configurationService (optional)
         *
         * @return {Object}
         */
        using: function(locale, configurationService)
        {
            var other = this;

            return {

                /**
                 * Retrieves a message for the current locale and applies any tokens to it.
                 *
                 * @param key
                 * @param values
                 * @return {*}
                 */
                message: function(key, values)
                {
                    var self = this;

                    // all of the messages for this locale
                    var messageMap = other.messages(locale, configurationService);
                    if (!messageMap) {
                        messageMap = {};
                    }

                    var message = messageMap;

                    // allow for dot-delimited (.) separators in string
                    var ids = key.split(".");
                    for (var i = 0; i < ids.length; i++)
                    {
                        var id = ids[i];

                        message = message[id];
                        if (!message) {
                            break;
                        }
                    }

                    if (message && values && values.length > 0)
                    {
                        message = Ratchet.substituteTokens(message, values);
                    }

                    return message;
                },

                /**
                 * Produces a friendly string that identifies the relative amount of time between two dates.
                 *
                 * @param {Date} from   the original date
                 * @param [Date] to     the target date or if none provided, now is used
                 * @returns {String}    message
                 */
                relativeTime: function(from, to)
                {
                    var self = this;

                    var ago = false;
                    if (Ratchet.isUndefined(to))
                    {
                        to = new Date();
                        ago = true;
                    }

                    var seconds_duration = ((to - from) / 1000);
                    var minutes_duration = Math.floor(seconds_duration / 60);
                    var hours_duration  = Math.round(minutes_duration / 60);
                    var days_duration  = Math.round(minutes_duration / 1440);
                    var months_duration  = Math.round(minutes_duration / 43200);
                    var years_duration  = Math.round(minutes_duration / 525960);

                    var f = function(key, amount)
                    {
                        return self.message(key, [amount]);
                    };

                    var text = "";

                    if (minutes_duration <= 0)
                    {
                        text = f("relative.seconds", seconds_duration);
                    }
                    else if (minutes_duration == 1)
                    {
                        text = f("relative.minute", 1);
                    }
                    else if (minutes_duration < 45)
                    {
                        text = f("relative.minutes", minutes_duration);
                    }
                    else if (minutes_duration < 90)
                    {
                        text = f("relative.hour", 1);
                    }
                    else if (minutes_duration < 1440)
                    {
                        text = f("relative.hours", hours_duration);
                    }
                    else if (minutes_duration < 2880)
                    {
                        text = f("relative.day", 1);
                    }
                    else if (minutes_duration < 43200)
                    {
                        text = f("relative.days", days_duration);
                    }
                    else if (minutes_duration < 86400)
                    {
                        text = f("relative.month", 1);
                    }
                    else if (minutes_duration < 525960)
                    {
                        text = f("relative.months", months_duration);
                    }
                    else if (minutes_duration < 1051920)
                    {
                        text = f("relative.year", 1);
                    }
                    else
                    {
                        text = f("relative.years", years_duration);
                    }

                    if (ago)
                    {
                        text += " " + f("ago");
                    }

                    return text;
                },

                /**
                 * Produces a friendly string that describes a date relative to today.
                 *
                 * @param date
                 * @param format (optional)
                 * @param options (optional)
                 */
                relativeDate: function(date, format, options)
                {
                    var self = this;

                    if (format && Ratchet.isObject(format)) {
                        options = format;
                    }

                    if (!format) {
                        format = self.message("date-format.default");
                    }

                    var dateZero = new Date(date.getTime());
                    dateZero.setHours(0, 0, 0, 0);

                    var now = new Date();
                    var todayZero = new Date(now.getTime());
                    todayZero.setHours(0, 0, 0, 0);
                    var tomorrowZero = new Date(now.getTime());
                    tomorrowZero.add(1).days();
                    tomorrowZero.setHours(0, 0, 0, 0);
                    var yesterdayZero = new Date(now.getTime());
                    yesterdayZero.add(-1).days();
                    yesterdayZero.setHours(0, 0, 0, 0);

                    var result = "";
                    var defaults = {
                        // limit to just yesterday, today, tomorrow.
                        "limit": false
                    };

                    options = options || {};
                    Ratchet.merge(defaults, options);

                    if (dateZero.getTime() == todayZero.getTime())
                    {
                        result = this.message("relative.today");
                    }
                    else if (dateZero.getTime() == tomorrowZero.getTime())
                    {
                        result = this.message("relative.tomorrow");
                    }
                    else if (dateZero.getTime() == yesterdayZero.getTime())
                    {
                        result = this.message("relative.yesterday");
                    }

                    if (!options.limit && result === "")
                    {
                        var today = Date.today();
                        var lastSunday = new Date(now.getTime());
                        lastSunday.previous().sunday();
                        var lastLastSunday = new Date(lastSunday.getTime());
                        lastLastSunday.add(-7).days();
                        var nextSunday = new Date(now.getTime());
                        nextSunday.next().sunday();
                        var nextNextSunday = new Date(nextSunday.getTime());
                        nextNextSunday.add(7).days();

                        if (date.getTime() < today.getTime() && date.getTime() >= lastSunday.getTime())
                        {
                            // earlier This week
                            result = this.message("relative.earlierThisWeek");
                        }
                        else if (date.getTime() < lastSunday.getTime() && date.getTime() >= lastLastSunday.getTime())
                        {
                            // last week
                            result = this.message("relative.lastWeek");
                        }
                        else if (date.getTime() > today.getTime() && date.getTime() <= nextSunday.getTime())
                        {
                            // Later this week
                            result = this.message("relative.laterThisWeek");
                        }
                        else if (date.getTime() > nextSunday.getTime() && date.getTime() <= nextNextSunday.getTime())
                        {
                            // Next Week
                            result = this.message("relative.nextWeek");
                        }
                    }

                    if (result === "")
                    {
                        result = this.dateFormat(date, format);
                    }

                    return result;
                },

                dateFormat: function(date, mask, utc) {

                    var self = this;

                    /*
                     * Date Format 1.2.3
                     * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
                     * MIT license
                     *
                     * Includes enhancements by Scott Trenda <scott.trenda.net>
                     * and Kris Kowal <cixar.com/~kris.kowal/>
                     *
                     * Accepts a date, a mask, or a date and a mask.
                     * Returns a formatted version of the given date.
                     * The date defaults to the current date/time.
                     * The mask defaults to dateFormat.masks.default.
                     */

                    var dateFormat = function () {
                        var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                            timezoneClip = /[^-+\dA-Z]/g,
                            pad = function (val, len) {
                                val = String(val);
                                len = len || 2;
                                while (val.length < len) val = "0" + val;
                                return val;
                            };

                        // Regexes and supporting functions are cached through closure
                        return function (date, mask, utc) {
                            var dF = dateFormat;

                            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
                            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                                mask = date;
                                date = undefined;
                            }

                            // Passing date through Date applies Date.parse, if necessary
                            date = date ? new Date(date) : new Date();
                            if (isNaN(date)) throw SyntaxError("invalid date");

                            mask = String(dF.masks[mask] || mask || dF.masks["default"]);

                            // Allow setting the utc argument via the mask
                            if (mask.slice(0, 4) == "UTC:") {
                                mask = mask.slice(4);
                                utc = true;
                            }

                            var	_ = utc ? "getUTC" : "get",
                                d = date[_ + "Date"](),
                                D = date[_ + "Day"](),
                                m = date[_ + "Month"](),
                                y = date[_ + "FullYear"](),
                                H = date[_ + "Hours"](),
                                M = date[_ + "Minutes"](),
                                s = date[_ + "Seconds"](),
                                L = date[_ + "Milliseconds"](),
                                o = utc ? 0 : date.getTimezoneOffset(),
                                flags = {
                                    d:    d,
                                    dd:   pad(d),
                                    ddd:  dF.i18n.dayNames[D],
                                    dddd: dF.i18n.dayNames[D + 7],
                                    m:    m + 1,
                                    mm:   pad(m + 1),
                                    mmm:  dF.i18n.monthNames[m],
                                    mmmm: dF.i18n.monthNames[m + 12],
                                    yy:   String(y).slice(2),
                                    yyyy: y,
                                    h:    H % 12 || 12,
                                    hh:   pad(H % 12 || 12),
                                    H:    H,
                                    HH:   pad(H),
                                    M:    M,
                                    MM:   pad(M),
                                    s:    s,
                                    ss:   pad(s),
                                    l:    pad(L, 3),
                                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                                    t:    H < 12 ? "a"  : "p",
                                    tt:   H < 12 ? "am" : "pm",
                                    T:    H < 12 ? "A"  : "P",
                                    TT:   H < 12 ? "AM" : "PM",
                                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                                };

                            return mask.replace(token, function ($0) {
                                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                            });
                        };
                    }();

                    /*
                    // Some common format strings
                    dateFormat.masks = {
                        "default":      "ddd mmm dd yyyy HH:MM:ss",
                        shortDate:      "m/d/yy",
                        mediumDate:     "mmm d, yyyy",
                        longDate:       "mmmm d, yyyy",
                        fullDate:       "dddd, mmmm d, yyyy",
                        shortTime:      "h:MM TT",
                        mediumTime:     "h:MM:ss TT",
                        longTime:       "h:MM:ss TT Z",
                        isoDate:        "yyyy-mm-dd",
                        isoTime:        "HH:MM:ss",
                        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
                        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
                    };

                    // Internationalization strings
                    dateFormat.i18n = {
                        dayNames: [
                            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
                        ],
                        monthNames: [
                            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                        ]
                    };

                    // For convenience...
                    Date.prototype.format = function (mask, utc) {
                        return dateFormat(this, mask, utc);
                    };
                    */


                    // RATCHET EXTENSIONS

                    dateFormat.masks = {
                        "default":        self.message("date-format.default"),
                        "shortDate":      self.message("date-format.shortDate"),
                        "mediumDate":     self.message("date-format.mediumDate"),
                        "longDate":       self.message("date-format.longDate"),
                        "fullDate":       self.message("date-format.fullDate"),
                        "shortTime":      self.message("date-format.shortTime"),
                        "mediumTime":     self.message("date-format.mediumTime"),
                        "longTime":       self.message("date-format.longTime"),
                        "isoDate":        self.message("date-format.isoDate"),
                        "isoTime":        self.message("date-format.isoTime"),
                        "isoDateTime":    self.message("date-format.isoDateTime"),
                        "isoUtcDateTime": self.message("date-format.isoUtcDateTime")
                    };

                    var dayNames = [].concat(self.message("date-format.dayShortNames"), self.message("date-format.dayNames"));
                    var monthNames = [].concat(self.message("date-format.monthShortNames"), self.message("date-format.monthNames"));

                    dateFormat.i18n = {
                        dayNames: dayNames,
                        monthNames: monthNames
                    };

                    return dateFormat(date, mask, utc);
                }
            };
        }

    });

    Ratchet.Messages = new messagesClass();

    // add in default locale config
    Ratchet.Configuration.add({
        "evaluator": "locale",
        "condition": Ratchet.Messages.DEFAULT_LOCALE,
        "config": {
            "messages": {
                "date-format": {
                    "default":          "ddd mmm dd yyyy HH:MM:ss",
                    "shortDate":        "m/d/yy",
                    "mediumDate":       "mmm d, yyyy",
                    "longDate":         "mmmm d, yyyy",
                    "fullDate":         "dddd, mmmm d, yyyy",
                    "shortTime":        "h:MM TT",
                    "mediumTime":       "h:MM:ss TT",
                    "longTime":         "h:MM:ss TT Z",
                    "isoDate":          "yyyy-mm-dd",
                    "isoTime":          "HH:MM:ss",
                    "isoDateTime":      "yyyy-mm-dd'T'HH:MM:ss",
                    "isoUtcDateTime":   "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
                    "dayShortNames":    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    "dayNames":         ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    "monthShortNames":  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    "monthNames":       ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                },
                "relative": {
                    "seconds":          "{0} seconds",
                    "minute":           "{0} minute",
                    "minutes":          "{0} minutes",
                    "hour":             "{0} hour",
                    "hours":            "{0} hours",
                    "day":              "{0} day",
                    "days":             "{0} days",
                    "month":            "{0} month",
                    "months":           "{0} months",
                    "year":             "{0} year",
                    "years":            "{0} years",
                    "today":            "today",
                    "tomorrow":         "tomorrow",
                    "yesterday":        "yesterday",
                    "earlierThisWeek":  "earlier this week",
                    "lastWeek":         "last week",
                    "laterThisWeek":    "later this week",
                    "nextWeek":         "next week",
                    "ago":              "ago"
                }
            }
        }
    });

    return Ratchet.Messages;

})(jQuery);