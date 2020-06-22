"use strict";
exports.__esModule = true;
exports.IpBus = void 0;
var logger_console_1 = require("./logger-console");
var regexp_bus_1 = require("./regexp-bus");
var IpBus = /** @class */ (function () {
    function IpBus(parentLogger) {
        this.dispatchers = [];
        this.logger = new logger_console_1.LoggerConsole('ipbus', undefined, parentLogger);
        this.regExpBus = new regexp_bus_1.RegExpBus(this.logger);
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
                dispatcher.onUnsubscribe(channel);
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
exports.IpBus = IpBus;
