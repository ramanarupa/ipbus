"use strict";
exports.__esModule = true;
exports.RegExpBus = void 0;
var path_to_regexp_1 = require("path-to-regexp");
var list_listeners_1 = require("./list-listeners");
var logger_console_1 = require("./logger-console");
var RegExpBus = /** @class */ (function () {
    function RegExpBus(logger) {
        this.regexps = {};
        this.logger = new logger_console_1.LoggerConsole('regexp-bus', logger.level, logger);
    }
    RegExpBus.prototype.subscribe = function (channel, listener) {
        var r = this.regexps[channel];
        if (!r) {
            r = this.regexps[channel] = {
                list: new list_listeners_1.ListListeners(),
                match: path_to_regexp_1.match(channel)
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
        var list = new list_listeners_1.ListListeners();
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
exports.RegExpBus = RegExpBus;
