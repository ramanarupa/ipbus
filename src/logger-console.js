"use strict";
exports.__esModule = true;
exports.LoggerConsole = void 0;
var logger_1 = require("./types/logger");
var LoggerConsole = /** @class */ (function () {
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
            this.level = logger_1.LogLevel.info;
    }
    LoggerConsole.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.level >= logger_1.LogLevel.info) {
            this.log(console.log, args, false);
        }
    };
    LoggerConsole.prototype.trace = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.level >= logger_1.LogLevel.trace) {
            this.log(console.log, args, false);
        }
    };
    LoggerConsole.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.level >= logger_1.LogLevel.debug) {
            this.log(console.debug, args, false);
        }
    };
    LoggerConsole.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.level >= logger_1.LogLevel.warn) {
            this.log(console.warn, args, true);
        }
    };
    LoggerConsole.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.level >= logger_1.LogLevel.error) {
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
                    var traceLine = stack_1.split("\n")[3]; // 4 for Safari
                    a.push(traceLine);
                }
            }
            catch (e) {
                // ignore
            }
        func.apply(console, a);
    };
    return LoggerConsole;
}());
exports.LoggerConsole = LoggerConsole;
