(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.ipbus = {}));
}(this, (function (exports) { 'use strict';

    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["silent"] = 1] = "silent";
        LogLevel[LogLevel["error"] = 2] = "error";
        LogLevel[LogLevel["warn"] = 3] = "warn";
        LogLevel[LogLevel["info"] = 4] = "info";
        LogLevel[LogLevel["trace"] = 5] = "trace";
        LogLevel[LogLevel["debug"] = 6] = "debug";
    })(LogLevel || (LogLevel = {}));

    var LoggerConsole = (function () {
        function LoggerConsole(prefix, level, parent) {
            this.prefix = parent ? parent.prefix : '';
            if (Array.isArray(prefix)) {
                this.prefix += prefix.map(function (p) { return "[" + p + "]"; }).join('');
            }
            else if (prefix)
                this.prefix += "[" + prefix + "]";
            if (level)
                this.level = level;
            else if (parent)
                this.level = parent.level;
            else
                this.level = LogLevel.info;
        }
        LoggerConsole.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.level >= LogLevel.info) {
                this.log(console.log, args, false);
            }
        };
        LoggerConsole.prototype.trace = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.level >= LogLevel.trace) {
                this.log(console.log, args, false);
            }
        };
        LoggerConsole.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.level >= LogLevel.debug) {
                this.log(console.debug, args, false);
            }
        };
        LoggerConsole.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.level >= LogLevel.warn) {
                this.log(console.warn, args, true);
            }
        };
        LoggerConsole.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.level >= LogLevel.error) {
                this.log(console.error, args, true);
            }
        };
        LoggerConsole.prototype.log = function (func, args, stack) {
            var a = [];
            var d = new Date();
            var h = d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();
            var ms = d.getMilliseconds();
            var mcC = ms <= 99 ? '0' + ms : ms;
            a.push(String((h <= 9 ? '0' + h : h) + ':' + (m <= 9 ? '0' + m : m) + ':' + (s <= 9 ? '0' + s : s) + '.' + (ms <= 9 ? '00' + ms : mcC)));
            if (this.prefix) {
                a.push(this.prefix + ':');
            }
            for (var i = 0; i < args.length; i++) {
                a.push(args[i]);
            }
            if (stack)
                try {
                    var stack_1 = Error().stack;
                    if (stack_1) {
                        var traceLine = stack_1.split("\n")[3];
                        a.push(traceLine);
                    }
                }
                catch (e) {
                }
            func.apply(console, a);
        };
        return LoggerConsole;
    }());

    /**
     * Tokenize input string.
     */
    function lexer(str) {
        var tokens = [];
        var i = 0;
        while (i < str.length) {
            var char = str[i];
            if (char === "*" || char === "+" || char === "?") {
                tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
                continue;
            }
            if (char === "\\") {
                tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
                continue;
            }
            if (char === "{") {
                tokens.push({ type: "OPEN", index: i, value: str[i++] });
                continue;
            }
            if (char === "}") {
                tokens.push({ type: "CLOSE", index: i, value: str[i++] });
                continue;
            }
            if (char === ":") {
                var name = "";
                var j = i + 1;
                while (j < str.length) {
                    var code = str.charCodeAt(j);
                    if (
                    // `0-9`
                    (code >= 48 && code <= 57) ||
                        // `A-Z`
                        (code >= 65 && code <= 90) ||
                        // `a-z`
                        (code >= 97 && code <= 122) ||
                        // `_`
                        code === 95) {
                        name += str[j++];
                        continue;
                    }
                    break;
                }
                if (!name)
                    throw new TypeError("Missing parameter name at " + i);
                tokens.push({ type: "NAME", index: i, value: name });
                i = j;
                continue;
            }
            if (char === "(") {
                var count = 1;
                var pattern = "";
                var j = i + 1;
                if (str[j] === "?") {
                    throw new TypeError("Pattern cannot start with \"?\" at " + j);
                }
                while (j < str.length) {
                    if (str[j] === "\\") {
                        pattern += str[j++] + str[j++];
                        continue;
                    }
                    if (str[j] === ")") {
                        count--;
                        if (count === 0) {
                            j++;
                            break;
                        }
                    }
                    else if (str[j] === "(") {
                        count++;
                        if (str[j + 1] !== "?") {
                            throw new TypeError("Capturing groups are not allowed at " + j);
                        }
                    }
                    pattern += str[j++];
                }
                if (count)
                    throw new TypeError("Unbalanced pattern at " + i);
                if (!pattern)
                    throw new TypeError("Missing pattern at " + i);
                tokens.push({ type: "PATTERN", index: i, value: pattern });
                i = j;
                continue;
            }
            tokens.push({ type: "CHAR", index: i, value: str[i++] });
        }
        tokens.push({ type: "END", index: i, value: "" });
        return tokens;
    }
    /**
     * Parse a string for the raw tokens.
     */
    function parse(str, options) {
        if (options === void 0) { options = {}; }
        var tokens = lexer(str);
        var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
        var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
        var result = [];
        var key = 0;
        var i = 0;
        var path = "";
        var tryConsume = function (type) {
            if (i < tokens.length && tokens[i].type === type)
                return tokens[i++].value;
        };
        var mustConsume = function (type) {
            var value = tryConsume(type);
            if (value !== undefined)
                return value;
            var _a = tokens[i], nextType = _a.type, index = _a.index;
            throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
        };
        var consumeText = function () {
            var result = "";
            var value;
            // tslint:disable-next-line
            while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
                result += value;
            }
            return result;
        };
        while (i < tokens.length) {
            var char = tryConsume("CHAR");
            var name = tryConsume("NAME");
            var pattern = tryConsume("PATTERN");
            if (name || pattern) {
                var prefix = char || "";
                if (prefixes.indexOf(prefix) === -1) {
                    path += prefix;
                    prefix = "";
                }
                if (path) {
                    result.push(path);
                    path = "";
                }
                result.push({
                    name: name || key++,
                    prefix: prefix,
                    suffix: "",
                    pattern: pattern || defaultPattern,
                    modifier: tryConsume("MODIFIER") || ""
                });
                continue;
            }
            var value = char || tryConsume("ESCAPED_CHAR");
            if (value) {
                path += value;
                continue;
            }
            if (path) {
                result.push(path);
                path = "";
            }
            var open = tryConsume("OPEN");
            if (open) {
                var prefix = consumeText();
                var name_1 = tryConsume("NAME") || "";
                var pattern_1 = tryConsume("PATTERN") || "";
                var suffix = consumeText();
                mustConsume("CLOSE");
                result.push({
                    name: name_1 || (pattern_1 ? key++ : ""),
                    pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                    prefix: prefix,
                    suffix: suffix,
                    modifier: tryConsume("MODIFIER") || ""
                });
                continue;
            }
            mustConsume("END");
        }
        return result;
    }
    /**
     * Create path match function from `path-to-regexp` spec.
     */
    function match(str, options) {
        var keys = [];
        var re = pathToRegexp(str, keys, options);
        return regexpToFunction(re, keys, options);
    }
    /**
     * Create a path match function from `path-to-regexp` output.
     */
    function regexpToFunction(re, keys, options) {
        if (options === void 0) { options = {}; }
        var _a = options.decode, decode = _a === void 0 ? function (x) { return x; } : _a;
        return function (pathname) {
            var m = re.exec(pathname);
            if (!m)
                return false;
            var path = m[0], index = m.index;
            var params = Object.create(null);
            var _loop_1 = function (i) {
                // tslint:disable-next-line
                if (m[i] === undefined)
                    return "continue";
                var key = keys[i - 1];
                if (key.modifier === "*" || key.modifier === "+") {
                    params[key.name] = m[i].split(key.prefix + key.suffix).map(function (value) {
                        return decode(value, key);
                    });
                }
                else {
                    params[key.name] = decode(m[i], key);
                }
            };
            for (var i = 1; i < m.length; i++) {
                _loop_1(i);
            }
            return { path: path, index: index, params: params };
        };
    }
    /**
     * Escape a regular expression string.
     */
    function escapeString(str) {
        return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
    }
    /**
     * Get the flags for a regexp from the options.
     */
    function flags(options) {
        return options && options.sensitive ? "" : "i";
    }
    /**
     * Pull out keys from a regexp.
     */
    function regexpToRegexp(path, keys) {
        if (!keys)
            return path;
        // Use a negative lookahead to match only capturing groups.
        var groups = path.source.match(/\((?!\?)/g);
        if (groups) {
            for (var i = 0; i < groups.length; i++) {
                keys.push({
                    name: i,
                    prefix: "",
                    suffix: "",
                    modifier: "",
                    pattern: ""
                });
            }
        }
        return path;
    }
    /**
     * Transform an array into a regexp.
     */
    function arrayToRegexp(paths, keys, options) {
        var parts = paths.map(function (path) { return pathToRegexp(path, keys, options).source; });
        return new RegExp("(?:" + parts.join("|") + ")", flags(options));
    }
    /**
     * Create a path regexp from string input.
     */
    function stringToRegexp(path, keys, options) {
        return tokensToRegexp(parse(path, options), keys, options);
    }
    /**
     * Expose a function for taking tokens and returning a RegExp.
     */
    function tokensToRegexp(tokens, keys, options) {
        if (options === void 0) { options = {}; }
        var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function (x) { return x; } : _d;
        var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
        var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
        var route = start ? "^" : "";
        // Iterate over the tokens and create our regexp string.
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            if (typeof token === "string") {
                route += escapeString(encode(token));
            }
            else {
                var prefix = escapeString(encode(token.prefix));
                var suffix = escapeString(encode(token.suffix));
                if (token.pattern) {
                    if (keys)
                        keys.push(token);
                    if (prefix || suffix) {
                        if (token.modifier === "+" || token.modifier === "*") {
                            var mod = token.modifier === "*" ? "?" : "";
                            route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
                        }
                        else {
                            route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
                        }
                    }
                    else {
                        route += "(" + token.pattern + ")" + token.modifier;
                    }
                }
                else {
                    route += "(?:" + prefix + suffix + ")" + token.modifier;
                }
            }
        }
        if (end) {
            if (!strict)
                route += delimiter + "?";
            route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
        }
        else {
            var endToken = tokens[tokens.length - 1];
            var isEndDelimited = typeof endToken === "string"
                ? delimiter.indexOf(endToken[endToken.length - 1]) > -1
                : // tslint:disable-next-line
                    endToken === undefined;
            if (!strict) {
                route += "(?:" + delimiter + "(?=" + endsWith + "))?";
            }
            if (!isEndDelimited) {
                route += "(?=" + delimiter + "|" + endsWith + ")";
            }
        }
        return new RegExp(route, flags(options));
    }
    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     */
    function pathToRegexp(path, keys, options) {
        if (path instanceof RegExp)
            return regexpToRegexp(path, keys);
        if (Array.isArray(path))
            return arrayToRegexp(path, keys, options);
        return stringToRegexp(path, keys, options);
    }

    var ListListeners = (function () {
        function ListListeners() {
            this.listeners = [];
        }
        ListListeners.prototype.add = function (listener) {
            if (!this.listeners.some(function (l) { return l === listener; }))
                this.listeners.push(listener);
        };
        ListListeners.prototype.concat = function (list) {
            this.listeners = this.listeners.concat(list.listeners);
        };
        ListListeners.prototype.size = function () {
            return this.listeners.length;
        };
        ListListeners.prototype.at = function (index) {
            return this.listeners[index];
        };
        ListListeners.prototype.isExists = function (listener) {
            var index = this.listeners.indexOf(listener);
            return index !== -1;
        };
        ListListeners.prototype.remove = function (listener) {
            var index = this.listeners.indexOf(listener);
            if (index !== -1) {
                this.listeners.splice(index, 1);
            }
            return index != -1;
        };
        ListListeners.prototype.each = function (callback) {
            var listeners = this.listeners;
            for (var i = 0; i < listeners.length; ++i) {
                callback(listeners[i], i);
            }
        };
        ListListeners.prototype.any = function (callback) {
            var result = false;
            var listeners = this.listeners;
            for (var i = 0; i < listeners.length; ++i) {
                var listener = listeners[i];
                result = Boolean(callback(listener)) || result;
            }
            return result;
        };
        return ListListeners;
    }());

    var RegExpBus = (function () {
        function RegExpBus(logger) {
            this.regexps = {};
            this.logger = new LoggerConsole('regexp-bus', logger.level, logger);
        }
        RegExpBus.prototype.subscribe = function (channel, listener) {
            var r = this.regexps[channel];
            if (!r) {
                r = this.regexps[channel] = {
                    list: new ListListeners(),
                    match: match(channel)
                };
            }
            var exists = r.list.isExists(listener);
            if (!exists)
                r.list.add(listener);
            return !exists;
        };
        RegExpBus.prototype.unsubscribe = function (channel, listener) {
            var r = this.regexps[channel];
            if (!r)
                return false;
            if (listener) {
                var result = r.list.remove(listener);
                if (result && r.list.size() === 0)
                    delete this.regexps[channel];
                return result;
            }
            delete this.regexps[channel];
            return true;
        };
        RegExpBus.prototype.publish = function (event, source, target) {
            var channel = event.channel;
            var list = this.buildCacheLine(channel);
            var self = this;
            return list.any(function (listener) {
                if (target && target !== listener)
                    return false;
                if (source === listener)
                    return false;
                try {
                    return listener.process(event, source);
                }
                catch (e) {
                    self.logger.error("Error during processing event", event, ', error:', e);
                    return false;
                }
            });
        };
        RegExpBus.prototype.getAllChannels = function () {
            return Object.keys(this.regexps);
        };
        RegExpBus.prototype.buildCacheLine = function (channel) {
            var list = new ListListeners();
            for (var index in this.regexps) {
                var r = this.regexps[index];
                var params = r.match(channel);
                if (params)
                    list.concat(r.list);
            }
            return list;
        };
        return RegExpBus;
    }());

    var IpBus = (function () {
        function IpBus(parentLogger) {
            this.dispatchers = [];
            this.logger = new LoggerConsole('ipbus', undefined, parentLogger);
            this.regExpBus = new RegExpBus(this.logger);
        }
        IpBus.prototype.addDispatcher = function (dispatcher) {
            var i = this.dispatchers.indexOf(dispatcher);
            if (i === -1)
                this.dispatchers.push(dispatcher);
            else {
                this.logger.warn('trying to add existance dispatcher');
            }
        };
        IpBus.prototype.removeDispatcher = function (dispatcher) {
            var i = this.dispatchers.indexOf(dispatcher);
            if (i !== -1)
                this.dispatchers.splice(i, 1);
        };
        IpBus.prototype.subscribe = function (channel, listener) {
            if (this.regExpBus.subscribe(channel, listener)) {
                this.dispatchers.forEach(function (dispatcher) {
                    dispatcher.onSubscribe(channel, listener);
                });
            }
        };
        IpBus.prototype.unsubscribe = function (channel, listener) {
            var result = this.regExpBus.unsubscribe(channel, listener);
            if (result) {
                this.dispatchers.forEach(function (dispatcher) {
                    dispatcher.onUnsubscribe(channel, listener);
                });
            }
            return result;
        };
        IpBus.prototype.publish = function (channel, data, sourceListener) {
            var event = {
                channel: channel,
                data: data
            };
            return this.regExpBus.publish(event, sourceListener);
        };
        return IpBus;
    }());

    var SimpleListener = (function () {
        function SimpleListener(handler, prefix) {
            this.originId = (prefix || 'simple') + "-" + new Date().getTime();
            this.handler = handler ? handler.bind(this) : undefined;
        }
        SimpleListener.prototype.process = function (event, source) {
            if (this.handler) {
                return this.handler(event, source);
            }
            return false;
        };
        return SimpleListener;
    }());

    var assertNotNull = function (value, message) {
        if (value === null || value === undefined) {
            throw new Error(message || "assertNotNull failed");
        }
        return value;
    };
    var assertNull = function (value, message) {
        if (value !== null && value !== undefined) {
            throw new Error(message || "assertNull failed");
        }
        return value;
    };

    exports.IpBus = IpBus;
    exports.ListListeners = ListListeners;
    exports.LoggerConsole = LoggerConsole;
    exports.SimpleListener = SimpleListener;
    exports.assertNotNull = assertNotNull;
    exports.assertNull = assertNull;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ipbus.js.map
