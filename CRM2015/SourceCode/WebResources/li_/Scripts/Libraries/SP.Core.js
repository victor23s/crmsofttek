var JSON;
if (!JSON) {
    JSON = {}
} (function () {
    "use strict";
    function f(n) {
        return n < 10 ? '0' + n : n
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z': null
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key) {
            return this.valueOf()
        }
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap, indent, meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    },
    rep;
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + string + '"'
    }
    function str(key, holder) {
        var i, k, v, length, mind = gap,
        partial, value = holder[key];
        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key)
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value)
        }
        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
            case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null'
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null'
                }
                v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                gap = mind;
                return v
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ': ':') + v)
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ': ':') + v)
                        }
                    }
                }
            }
            v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v
        }
    }
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' '
                }
            } else if (typeof space === 'string') {
                indent = space
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify')
            }
            return str('', {
                '': value
            })
        }
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v
                            } else {
                                delete value[k]
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value)
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
                })
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ? walk({
                    '': j
                },
                '') : j
            }
            throw new SyntaxError('JSON.parse')
        }
    }
} ());

// TODO: Comment unsupported methods.

(function (undefined) {
    // Define any regex's used
    var trimRE = /^\s+|\s+$/g,
    digitRE = /\d+/,
    formatDigitRE = /{\d+}/g,
    serverUrlRE = /^(?:http)(?:s)?\:\/\/([^\/]+)/i,
    jsPathRE = /sandisk_\/Scripts\/Libraries\/SP.Core.js/,
    curlyBracesRE = /%7b.*%7d/,
    webResourcesRE = /[^{]*/,
    endsWithSlashRE = /\/$/,

    // Save references to any methods used often
    slice = [].slice,
    toString = Object.prototype.toString,

    // Create a XMLHttpRequest object for lazy loading
    request = new XMLHttpRequest();

    Function.prototype.memoized = function (key) {
        this._values = this._values || {};
        return this._values[key] !== undefined ? this._values[key] : this._values[key] = this.apply(this, arguments);
    };

    Function.prototype.memoize = function () {
        var cache = {},
        self = this,

        memoizedFn = function () {
            // Copy the arguments object into an array: allows it to be used as
            // a cache key.
            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args[i] = arguments[i];
            }

            // Evaluate the memoized function if it hasn't been evaluated with
            // these arguments before.
            if (! (args in cache)) {
                cache[args] = self.apply(this, arguments);
            }

            return cache[args];
        };

        return memoizedFn;
    };

    function Namespace(name) {
        if (this instanceof arguments.callee === false) {
            return new Namespace(name);
        }

        this.name = name;
        return this;
    }

    Namespace.prototype.__namespace = true;
    Namespace.prototype.namespace = function (name) {
        return this[name] || (
        this[name] = new Namespace((this.name ? this.name + "." : "") + name));
    };
    Namespace.prototype.extend = extend;
    Namespace.prototype.toString = function () {
        return this.name;
    }
    Namespace.prototype.declareMethods = function (functionNameArray) {
        var currentNS = this;
        for (var i = 0, len = functionNameArray.length; i < len; i++) {
            this[functionNameArray[i]] = (function (methodName) {
                return function () {
                    // If the this keyword refers to this function, this function is being called with the new keyword in front of it,
                    // so pass that information along to _lazyLoad
                    var useNewKeyword = this instanceof arguments.callee;

                    return _lazyLoad.call(currentNS, useNewKeyword, methodName, arguments);
                }
            })(functionNameArray[i]);
        }

        return this;
    };

    function extend(options) {
        for (var i in options) {
            if (options.hasOwnProperty(i)) {
                this[i] = options[i];
            }
        }
        return this;
    }

    // Create the Sonoma namespace first so that we can add our Sonoma.String/Array/Date/etc helper methods first.
    Namespace.prototype.namespace.call(this, "Sonoma").extend((function () {
        var classToTypeTable = {};

        var types = "Boolean Number String Function Array Date RegExp Object".split(" ");
        for (var i = 0; i < types.length; i++) {
            classToTypeTable["[object " + types[i] + "]"] = types[i].toLowerCase();
        }

        function type(obj) {
            /// <summary>Takes in an object of any type and returns its type as an all lowercase string.</summary>
            /// <return>string</return>
            return obj == null ? String(obj) : classToTypeTable[toString.call(obj)] || "object";
        }

        return {
            type: type
        };

    })());

    Sonoma.namespace("String").extend((function () {
        function format(s, args) {
            if (!s) return "";

            args = slice.call(arguments, 1);
            var matches = s.match(formatDigitRE);
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    var index = parseInt(matches[i].match(digitRE), 10);
                    if (args.length > index) {
                        s = s.replace(matches[i], args[index]);
                    }
                }
            }

            return s;
        }

        function trim(s) {
            return s.replace(trimRE, "");
        }

        function concat() {
            var args = slice.call(arguments, 0);
            return args.join("");
        }

        function isNullOrEmpty(s) {
            return s === "" || s === undefined || s === null;
        }

        function padLeft(s, padChar, padCount) {
            var resultArray = [];

            while (padCount-->0) {
                resultArray.push(padChar);
            }

            resultArray.push(s);
            return resultArray.join("");
        }

        return {
            format: format,
            trim: trim,
            concat: concat,
            isNullOrEmpty: isNullOrEmpty,
            padLeft: padLeft
        };
    })());

    Sonoma.namespace("Date").extend((function () {
        var dateMetadata = {
            ShortDatePattern: "M/d/yyyy",
            ShortTimePattern: "h:mm tt",
            AMDesignator: "AM",
            PMDesignator: "PM"
        };

        try {
            // Try to get the date metadata info from CRM.
            dateMetadata = Sys.CultureInfo.CurrentCulture.dateTimeFormat;
        }
        catch(e) {}

        function _formatDate(d, pattern) {
            var fd = d.toString();

            fd = pattern.replace(/yyyy/g, d.getFullYear());
            fd = fd.replace(/yy/g, (d.getFullYear() + "").substring(2));

            var month = d.getMonth();
            fd = fd.replace(/MM/g, month + 1 < 10 ? "0" + (month + 1) : month + 1);
            fd = fd.replace(/(\\)?M/g, function ($0, $1) {
                return $1 ? $0 : month + 1;
            });

            var day = d.getDate();
            fd = fd.replace(/dd/g, day < 10 ? "0" + day : day);
            fd = fd.replace(/(\\)?d/g, function ($0, $1) {
                return $1 ? $0 : day;
            });

            var militaryHour = d.getHours();
            var shortHour = militaryHour > 12 ? militaryHour - 12 : militaryHour;

            fd = fd.replace(/HH/g, militaryHour < 10 ? "0" + militaryHour : militaryHour);
            fd = fd.replace(/(\\)?H/g, function ($0, $1) {
                return $1 ? $0 : militaryHour;
            });

            fd = fd.replace(/hh/g, militaryHour < 10 ? "0" + shortHour : shortHour);
            fd = fd.replace(/(\\)?h/g, function ($0, $1) {
                return $1 ? $0 : shortHour;
            });

            var minutes = d.getMinutes();
            fd = fd.replace(/mm/g, minutes < 10 ? "0" + minutes : minutes);
            fd = fd.replace(/(\\)?m/g, function ($0, $1) {
                return $1 ? $0 : minutes;
            });

            var seconds = d.getSeconds();
            fd = fd.replace(/ss/g, seconds < 10 ? "0" + seconds : seconds);
            fd = fd.replace(/(\\)?s/g, function ($0, $1) {
                return $1 ? $0 : seconds;
            });

            fd = fd.replace(/fff/g, d.getMilliseconds());

            fd = fd.replace(/tt/g, d.getHours() > 12 || d.getHours() == 0 ? dateMetadata.PMDesignator : dateMetadata.AMDesignator);

            return fd.replace(/\\/g, "");
        }

        function parse(d) {
            var timestamp = Date.parse(d),
            minutesOffset = 0,
            struct;

            if (isNaN(timestamp) && (struct = /(\d{4})-?(\d{2})-?(\d{2})(?:[T ](\d{2}):?(\d{2}):?(\d{2})?(?:\.(\d{3,}))?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?))/.exec(d))) {
                if (struct[8] !== 'Z') {
                    minutesOffset = +struct[10] * 60 + (+struct[11]);

                    if (struct[9] === '+') {
                        minutesOffset = 0 - minutesOffset;
                    }
                }

                timestamp = Date.UTC(+struct[1], +struct[2] - 1, +struct[3], +struct[4], +struct[5] + minutesOffset, +struct[6], +struct[7].substr(0, 3));
            }

            return timestamp;
        }

        function toISOString(d) {
            var month = d.getUTCMonth() + 1;
            if (month.toString().length == 1) month = Sonoma.String.padLeft(month, '0', 1);
            var date = d.getUTCDate();
            if (date.toString().length == 1) date = Sonoma.String.padLeft(date, '0', 1);
            var hours = d.getUTCHours();
            if (hours.toString().length == 1) hours = Sonoma.String.padLeft(hours, '0', 1);
            var min = d.getUTCMinutes();
            if (min.toString().length == 1) min = Sonoma.String.padLeft(min, '0', 1);
            var sec = d.getUTCSeconds();
            if (sec.toString().length == 1) sec = Sonoma.String.padLeft(sec, '0', 1);
            var milli = d.getUTCMilliseconds();
            if (milli.toString().length == 1) milli = Sonoma.String.padLeft(milli, '0', 2);
            else if (milli.toString().length == 2) milli = Sonoma.String.padLeft(milli, '0', 1);

            return d.getUTCFullYear() + '-' + month + '-' + date + 'T' + hours + ':' + min + ':' + sec + '.' + milli + 'Z';
        }

        function convert(d) {
            switch (Sonoma.type(d)) {
            case "date":
                return d;
            case "array":
                return new Date(d[0], d[1], d[2]);
            case "number":
                case "string":
                return new Date(d);
            case "object":
                if (d.year !== undefined && d.month !== undefined && d.date !== undefined) {
                    return new Date(d.year, d.month, d.date);
                }
            }

            return NaN;
        }

        function inRange(d, start, end) {
            return (
            isFinite(d = convert(d).valueOf()) && isFinite(start = convert(start).valueOf()) && isFinite(end = convert(end).valueOf()) ? start <= d && d <= end : NaN);
        }

        function zeroTime(d) {
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);

            return d;
        }

        function getShortDateFormat(d) {
            return _formatDate(d, dateMetadata.ShortDatePattern);
        }

        function getShortDateTimeFormat(d) {
            return _formatDate(d, dateMetadata.ShortTimePattern);
        }

        return {
            parse: parse,
            toISOString: toISOString,
            convert: convert,
            inRange: inRange,
            zeroTime: zeroTime,
            getShortDateFormat: getShortDateFormat,
            getShortDateTimeFormat: getShortDateTimeFormat
        };

    })());

    Sonoma.extend((function () {
        if (window.SP !== undefined) {
            // Save a reference to the old SP so we can revert back to it if necessary.
            _SP = SP;
        }

        if (window.top.SP !== undefined) {
            // Do the same for the outer-most window, so that people can use SP
            // from the dev toolbar if necessary, but still roll it back just incase.
            window.top._SP = window.top.SP;
        }

        function getServerUrl() {
            var correctHost = window.location.host,
            xrmServerUrl = "",
            globalContext, hasBadHost = true,
            hasBadProtocol = false;

            if (window.Xrm && Xrm.Page && Xrm.Page.context) {
                xrmServerUrl = Xrm.Page.context.getClientUrl();
            }
            else if (window.GetGlobalContext) {
                xrmServerUrl = GetGlobalContext().getClientUrl();
            }
            else {
                var windowUrl = unescape(window.location.href).toLowerCase();
                if (windowUrl.indexOf("/webresources") !== -1) {
                    var leftOfWebResource = windowUrl.split("/webresources")[0];
                    xrmServerUrl = leftOfWebResource.match(webResourcesRE)[0];

                    hasBadHost = false;
                }
            }

            if (!xrmServerUrl) {
                alert("Unable to determine server url using Sonoma.getClientUrl.  Please include ClientGlobalContext.js.aspx.");
                return;
            }

            hasBadProtocol = xrmServerUrl.indexOf(window.location.protocol) === -1;

            if (hasBadHost) {
                var badHost = xrmServerUrl.match(serverUrlRE)[1];
                xrmServerUrl = xrmServerUrl.replace(badHost, correctHost);
            }

            if (hasBadProtocol) {
                xrmServerUrl = window.location.protocol + xrmServerUrl.substring(xrmServerUrl.indexOf(":") + 1)
            }

            if (xrmServerUrl.match(endsWithSlashRE)) xrmServerUrl = xrmServerUrl.substring(0, xrmServerUrl.length - 1);

            return xrmServerUrl;
        }

        var baseScriptUrl = (function () {
            var baseUrl = getServerUrl(),
            scripts = document.getElementsByTagName("script"),
            src = "",
            timestamp = "";

            for (var i = 0, len = scripts.length; i < len; i++) {
                if (src = scripts[i].src) {
                    src = src.toLowerCase();
                    if (src.match(jsPathRE) && (timestamp = src.match(curlyBracesRE))) {
                        baseUrl += "/" + timestamp[0];
                        break;
                    }
                }
            }

            return baseUrl + "/WebResources/sandisk_/Scripts/Libraries/";
        })();

        function AttributeList() {
            var that = this;
            this.length = 0;

            var supportedFunction = ["addOnChange", "fireOnChange", "getAttributeType", "getFormat", "getInitialValue", "getIsDirty", "getMax", "getMaxLength", "getMin", "getName", "getOption", "getParent", "getPrecision", "getRequiredLevel", "getSelectedOption", "getSubmitMode", "getText", "getUserPrivilege", "getValue", "removeOnChange", "setRequiredLevel", "setSubmitMode", "setValue"];

            each(supportedFunction, function (index, fnName) {
                that[fnName] = function () {
                    var args = arguments;
                    var returnVal = null;

                    // Use a for statement instead of each() because this is an array/object hybrid
                    for (var i = 0; i < this.length; i++) {
                        var attribute = this[i];

                        var result = attribute[fnName].apply(attribute, args);
                        if (result && returnVal === null) {
                            returnVal = result;
                        }
                    }

                    return returnVal || that;
                };
            });
        }

        function getAttribute(args) {
            var results = new AttributeList();
            if (Sonoma.type(args) !== "array") {
                args = slice.call(arguments, 0);
            }

            each(args, function (index, id) {
                var attribute = getSingleAttribute(id);
                if (attribute) {
                    if (Sonoma.type(attribute) !== "array") {
                        attribute = [attribute];
                    }

                    each(attribute, function () {
                        Array.prototype.push.call(results, this);
                    });
                }
            });

            return results;
        }

        var getSingleAttribute = (function (attributeId) {
            if (window.Xrm && Xrm.Page && Xrm.Page.getAttribute) {
                return Xrm.Page.getAttribute(attributeId);
            }

            throw "Cannot use getAttribute: Xrm.Page.getAttribute is not available."
        }).memoize();

        function ControlList() {
            var that = this;
            this.length = 0;

            var supportedFunction = ["addCustomView", "addOption", "clearOptions", "getAttribute", "getControlType", "getData", "getDefaultView", "getDisabled", "getLabel", "getName", "getParent", "getSrc", "getInitialUrl", "getObject", "getVisible", "refresh", "removeOption", "setData", "setDefaultView", "setDisabled", "setFocus", "setLabel", "setSrc", "setVisible"];

            each(supportedFunction, function (index, fnName) {
                that[fnName] = function () {
                    var args = arguments;
                    var returnVal = null;

                    // Use a for statement instead of each() because this is an array/object hybrid
                    for (var i = 0; i < this.length; i++) {
                        var control = this[i];

                        if (control[fnName]) {
                            var result = control[fnName].apply(control, args);
                            if (result && returnVal === null) {
                                returnVal = result;
                            }
                        }
                    }

                    return returnVal || that;
                };
            });
        }

        function getControl(args) {
            var results = new ControlList();
            if (Sonoma.type(args) !== "array") {
                args = slice.call(arguments, 0);
            }

            each(args, function (index, id) {
                var control = getSingleControl(id);
                if (control) {
                    if (Sonoma.type(control) !== "array") {
                        control = [control];
                    }

                    each(control, function () {
                        Array.prototype.push.call(results, this);
                    });
                }
            });

            return results;
        }

        var getSingleControl = (function (controlId) {
            if (window.Xrm && Xrm.Page && Xrm.Page.getControl) {
                return Xrm.Page.getControl(controlId);
            }

            throw "Cannot use getControl: Xrm.Page.getControl is not available."
        }).memoize();

        function areEqual() {
            /// <summary>Takes in n parameters and returns if they are all equal using a strict comparison check.</summary>
            /// <returns>Boolean</return>
            var args = slice.call(arguments, 0);

            if (args.length === 0) {
                return true;
            }

            var lastArg = args[0];

            return each(args, function (i, a) {
                var eq = a === lastArg;

                lastArg = a;
                return eq;
            });
        }

        function getQueryStringParams() {
            var searchString = window.location.search.substring(1);
            var params = {};

            var nameValuePairs = searchString.split('&');
            var nameValuePair;
            for (var i = 0; i < nameValuePairs.length; i++) {
                nameValuePair = nameValuePairs[i].split('=');
                if (nameValuePair.length == 2) {
                    params[nameValuePair[0]] = unescape(nameValuePair[1]);
                    params[nameValuePair[0].toLowerCase()] = unescape(nameValuePair[1]);
                }
            }

            return params;
        }

        function each(obj, callback) {
            if (Sonoma.type(callback) !== "function") return;

            switch (Sonoma.type(obj)) {
            case "array":
                for (var i = 0; i < obj.length; i++) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        return false;
                    }
                }

                return true;
            case "object":
                for (var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        if (callback.call(obj[i], i, obj[i]) === false) {
                            return false;
                        }
                    }
                }

                return true;
            default:
                throw new Error("Sonoma.each does not support the object " + obj.toString());
            }
        }

        function noConflict() {
            if (window._SP !== undefined) {
                SP = _SP;
            }

            if (window.top._SP !== undefined) {
                window.top.SP = window.top._SP;
            }
        }

        function getServerUrlWithoutOrg() {
            var orgName = null,
            serverUrl;

            if (window.Xrm && Xrm.Page && Xrm.Page.context) {
                orgName = Xrm.Page.context.getOrgUniqueName();
            }
            else if (window.GetGlobalContext) {
                orgName = GetGlobalContext().getOrgUniqueName();
            }

            if (!orgName) {
                alert("Unable to determine the organization name using Sonoma.getClientUrlWithoutOrg.  Please include ClientGlobalContext.js.aspx.");
                return;
            }

            serverUrl = getServerUrl();
            if (serverUrl.indexOf(orgName) > 8) { // orgName is not in the server portion of the URL (IFD)
                serverUrl = serverUrl.replace(orgName, '');
            }

            if (!serverUrl.match(endsWithSlashRE)) {
                serverUrl = serverUrl + '/';
            }

            return serverUrl;
        }

        return {
            areEqual: areEqual,
            each: each,
            getServerUrl: getServerUrl,
            getServerUrlWithoutOrg: getServerUrlWithoutOrg,
            baseScriptUrl: baseScriptUrl,
            noConflict: noConflict,
            queryStringParams: getQueryStringParams(),
            getAttribute: getAttribute,
            getControl: getControl,
            version: "5.0.25.68819"
        };

    })());

    Sonoma.namespace("Guid").extend((function () {
        var bracketsRE = /[{}]/g,
        guidRE = /\{?([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}?$/,
        normalizeRE = /[ {}-]/g;

        function decapsulate(guid) {
            return guid.replace(bracketsRE, "").toLowerCase();
        }

        function encapsulate(guid) {
            return "{" + decapsulate(guid) + "}";
        }

        function isValid(guid) {
            if (Sonoma.type(guid) !== "string") {
                return false;
            }

            var hasValidBrackets = (guid.indexOf("{") === -1 && guid.indexOf("}") === -1) || (guid.indexOf("{") === 0 && guid.indexOf("}") === guid.length - 1);

            return hasValidBrackets && guidRE.test(guid);
        }

        function _normalizeGuid(guid) {
            if (Sonoma.type(guid) !== "string") {
                return null;
            }

            return guid.replace(normalizeRE, "").toLowerCase();
        }

        function areEqual() {
            var normalizedGuids = [];
            var args = slice.call(arguments, 0);

            Sonoma.each(args, function () {
                normalizedGuids.push(_normalizeGuid(this));
            });

            return Sonoma.areEqual.apply(null, normalizedGuids);
        }

        return {
            decapsulate: decapsulate,
            encapsulate: encapsulate,
            isValid: isValid,
            areEqual: areEqual
        };

    })());

    Sonoma.namespace("Clipboard").extend((function () {
        function copy(o) {
            if (window.clipboardData && clipboardData.setData && Sonoma.type(o) === "string") {
                return clipboardData.setData("Text", o);
            }
        }

        return {
            copy: copy
        };

    })());

    Sonoma.namespace("Cache").extend((function () {
        var cache = [];

        function _getTargetFromCache(target) {
            for (var i = 0, cacheLength = cache.length; i < cacheLength; i++) {
                if (cache[i].target === target) {
                    return cache[i];
                }
            }

            // If we reach this point, the target is not in the cache, so add it and return it
            var newCacheObject = {
                target: target,
                cacheData: []
            };
            cache.push(newCacheObject);

            return newCacheObject;
        }

        function getData(target, key) {
            var targetCacheData = _getTargetFromCache(target);

            for (var i = 0, cacheDataLength = targetCacheData.cacheData.length; i < cacheDataLength; i++) {
                if (targetCacheData.cacheData[i].key === key) {
                    return targetCacheData.cacheData[i].value;
                }
            }

            return null;
        }

        function setData(target, key, value) {
            var targetCacheData = _getTargetFromCache(target);

            for (var i = 0, cacheDataLength = targetCacheData.cacheData.length; i < cacheDataLength; i++) {

                if (targetCacheData.cacheData[i].key === key) {
                    targetCacheData.cacheData[i].value = value;
                    return;
                }
            }

            targetCacheData.cacheData.push({
                key: key,
                value: value
            });
        }

        return {
            get: getData,
            set: setData
        };

    })());

    Sonoma.namespace("LocalStorage").extend((function () {

        var ticksPerHours = 3600000;

        if (!window.localStorage) {
            window.localStorage = {
                getItem: function () {
                    return null;
                },
                setItem: function () {

},
                removeItem: function () {

}
            };
        }

        function get(key) {

            var returnValue = null;

            var existingItem = localStorage.getItem(key);
            if (existingItem) {
                existingItem = JSON.parse(existingItem);
                var expirationDate = existingItem.expiration || 0;
                if (expirationDate && expirationDate <= new Date().valueOf()) {
                    // If the expiration date is in the past, clear the value and reset the expiration
                    localStorage.removeItem(key);
                }
                else {
                    returnValue = existingItem.value;
                }
            }

            return returnValue;
        }

        function set(key, value, expirationInHours) {

            if (value === null) {
                localStorage.removeItem(key);
            }
            else {
                value = {
                    value: value,
                    expiration: null
                };

                if (expirationInHours) {
                    var expirationDate = new Date(new Date().valueOf() + (ticksPerHours * expirationInHours));
                    value.expiration = expirationDate.valueOf();
                }

                localStorage.setItem(key, JSON.stringify(value));
            }
        }

        return {
            set: set,
            get: get
        };

    })());

    // TODO: Keep, but add Sonoma.Log.js
    Sonoma.namespace("Log").extend((function () {
        var logList = [];

        function log(s) {
            // How to handle non-string types?
            if (window.console && console.log) {
                console.log(s);
            }

            logList.push(s);
        }

        function show() {
            alert(logList.join("\n"));
        }

        return {
            log: log,
            show: show
        };

    })());

    // To avoid errors in UR12
    Sonoma.namespace("Xml").extend((function () {
        var xmlParserFn, defaultNamespaceRE = /(?:\w+:)?(\w+)/g;

        var nodeFunctions = (function () {
            var selectSingleNode, selectNodes, evaluator, resultNode, querySelector, queryNamespace;

            if (window.DOMParser && typeof XMLDocument !== "undefined") {
                function fixNamespaceSelector(selector) {
                    return selector.replace(defaultNamespaceRE, "*[local-name()='$1']");
                }

                function getNodeIterator(contextNode, selector) {
                    var document = contextNode.ownerDocument || contextNode;
                    return document.evaluate(fixNamespaceSelector(selector), contextNode, null, XPathResult.ANY_TYPE, null);
                }

                selectSingleNode = function (contextNode, selector) {
                    var node = getNodeIterator(contextNode, selector).iterateNext();
                    if (node) {
                        node.text = node.textContent;
                    }

                    return node;
                };

                selectNodes = function (contextNode, selector) {
                    var nodes = [],
                    iterator = getNodeIterator(contextNode, selector),
                    node = iterator.iterateNext();

                    while (node) {
                        nodes.push(node);
                        node = iterator.iterateNext();
                    }

                    return nodes;
                };

                XMLDocument.prototype.selectSingleNode = Element.prototype.selectSingleNode = function (selector) {
                    return selectSingleNode(this, selector);
                };

                XMLDocument.prototype.selectNodes = Element.prototype.selectNodes = function (selector) {
                    return selectNodes(this, selector);
                };
            }
            else {
                selectSingleNode = function (contextNode, selector) {
                    if (contextNode.xml !== undefined) {
                        return contextNode.selectSingleNode(selector);
                    };

                    var word = selector.substring(selector.lastIndexOf("/") + 1, selector.length);

                    if (jQuery.isXMLDoc(contextNode)) {
                        if (contextNode.getElementsByTagName(word)[0] && !contextNode.getElementsByTagName(word)[0].text) {
                            contextNode.getElementsByTagName(word)[0].text = contextNode.getElementsByTagName(word)[0].textContent;
                        }
                        return contextNode.getElementsByTagName(word)[0];
                    } else {
                        contextNode.getElementsByTagName(word)[0].text = contextNode.getElementsByTagName(word)[0].textContent;
                        return contextNode.getElementsByTagName(word)[0];
                    };
                };

                selectNodes = function (contextNode, selector) {
                    if (contextNode.xml !== undefined) {
                        return contextNode.selectNodes(selector);
                    };

                    var word;
                    if (selector.subString) {
                        word = selector.subString(selector.lastIndexOf("/") + 1, selector.length);
                    }
                    else {
                        word = selector.substring(selector.lastIndexOf("/") + 1, selector.length);
                    }

                    var result = typeof contextNode.getElementsByTagName != "undefined" && typeof contextNode.getElementsByTagName != "unknown" ? contextNode.getElementsByTagName(word) : $(contextNode).find(selector);

                    return result;
                }
            }

            return {
                selectSingleNode: selectSingleNode,
                selectNodes: selectNodes
            };
        })();

        function loadXml(xml) {
            if (!xmlParserFn) {
                if (window.DOMParser && typeof XMLDocument !== "undefined") {
                    xmlParserFn = function (s) {
                        return (new window.DOMParser()).parseFromString(s, "text/xml");
                    };
                } else if (window.ActiveXObject && new window.ActiveXObject("Microsoft.XMLDOM")) {
                    xmlParserFn = function (s) {
                        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async = "false";
                        xmlDoc.loadXML(s);

                        return xmlDoc;
                    };
                } else {
                    throw new Error("No XML parser found.");
                }
            }

            // Remove all namespaces from tag names as well as xmlns attributes.  This causes issues in non-IE browsers
            // and without knowing exactly what all of them are, it's simply easier to work without them.
            return xmlParserFn(xml);
        }

        return {
            loadXml: loadXml,
            selectSingleNode: nodeFunctions.selectSingleNode,
            selectNodes: nodeFunctions.selectNodes
        };
    })());

    function _lazyLoad(useNewKeyword, methodName, args) {
        for (var i = 0; i < this.dependencies.length; i++) {
            try {
                request.open("GET", Sonoma.baseScriptUrl + this.dependencies[i], false);
                request.send();
                var js = request.responseText;
                eval(js);
            }
            catch(e) {
                throw new Error("Unable to lazy load method " + this.toString() + "." + methodName + ":\n\n" + e.message);
            }
        }

        if (useNewKeyword) {
            // This will be true when using the new keyword, such as new SP.OrgService.Boolean();
            var returnVal = new this[methodName]();
            this[methodName].apply(returnVal, args);

            return returnVal;
        }
        else {
            return this[methodName].apply(this, args);
        }
    }

    Sonoma.namespace("Form").declareMethods(["getXrmAttributes", "hideFields", "showFields", "getLeftNavLinks", "hideLeftNavLinks", "showLeftNavLinks", "getLeftNavGroups", "hideLeftNavGroup", "showLeftNavGroup"
    //, "onLeftNavLoad"
    ]).extend({
        dependencies: ["SP.Form.js"],

        // Public enums that need to be defined in this file
        onSaveMode: {
            Save: 1,
            SaveAndClose: 2,
            SaveAndNew: 59,
            SaveAsCompleted: 58,
            Deactivate: 5,
            Reactivate: 6,
            Assign: 47,
            Send: 7,
            Qualify: 16,
            Disqualify: 15
        }
    });

    Sonoma.namespace("Metadata").declareMethods(["getEntityByTypeCode", "getTypeCodeByEntity", "getOptionSetOption", "getOptionSetValue", "retrieveAllEntities", "retrieveAttribute", "retrieveAttributeSync", "retrieveEntity", "retrieveEntitySync", "retrieveOptionSet", "retrieveOptionSetSync"]).extend({
        dependencies: ["SP.Metadata.js"],

        // Public enums that need to be defined in this file
        entityFilters: {
            All: 15,
            // Entity Attributes Privileges Relationships
            Attributes: 3,
            // Entity Attributes
            Default: 1,
            // Entity
            Entity: 1,
            // Entity
            Privileges: 5,
            // Entity Privileges
            Relationships: 9 // Entity Relationships
        }
    });

    Sonoma.namespace("Fetch").declareMethods(["attribute", "linkEntity", "filter", "condition", "conditionMultiValue", "createXml", "createQuery", "stringify", "htmlEncode"]).extend({
        dependencies: ["SP.OrgService.js"],

        // Public enums that need to be defined in this file
        conditions: {
            NotNull: "not-null",
            Null: "null",
            NotEqualBusinessId: "ne-businessid",
            NotEqualUserId: "ne-userid",
            EqualBusinessId: "eq-businessid",
            EqualUserId: "eq-userid",
            Equal: "eq",
            NotEqual: "ne",
            In: "in",
            NotIn: "not-in"
        },
        filterType: {
            And: "and",
            Or: "or"
        }
    });

    Sonoma.namespace("OrgService").declareMethods(["create", "createSync", "update", "updateSync", "deleteRecord", "deleteRecordSync", "retrieve", "retrieveSync", "retrieveMultiple", "retrieveMultipleSync", "setState", "setStateSync", "assign", "assignSync", "associate", "associateSync", "disassociate", "disassociateSync", "execute", "executeSync", "Boolean", "DateTime", "EntityReference", "Guid", "Money", "OptionSetValue", "Decimal", "CRMAttribute"]).extend({
        dependencies: ["SP.OrgService.js"],

        // Public enums that need to be defined in this file
        attributeTypes: {
            Money: "Money",
            OptionSetValue: "OptionSetValue",
            Boolean: "Boolean",
            EntityReference: "EntityReference",
            DateTime: "DateTime",
            Decimal: "Decimal",
            Guid: "Guid"
        }
    });

    Sonoma.namespace("OData").declareMethods(["create", "createSync", "retrieve", "retrieveSync", "retrieveMultiple", "retrieveMultipleSync", "update, updateSync", "deleteRecord", "deleteRecordSync"]).extend({
        dependencies: ["SP.OData.js"]
    });

    // Allow devs to reference Sonoma from the javascript console without having to frames[0]
    window.top.Sonoma = Sonoma;
    window.top.SP = Sonoma;

    // Alias the Sonoma library as SP, which can be reverted by doing Sonoma.noConflict()
    SP = Sonoma;
})();