"use strict";
exports.__esModule = true;
exports.MessageListener = void 0;
var originId_1 = require("./originId");
var logger_console_1 = require("logger-console");
var MessageListener = /** @class */ (function () {
    function MessageListener(source, originId, parentLogger) {
        this.source = source;
        this.originId = originId || originId_1.generateOriginId();
        this.logger = new logger_console_1.LoggerConsole(this.originId, undefined, parentLogger);
        this.logger.trace('created message listener');
    }
    MessageListener.prototype.process = function (event) {
        return this.send('publish', event);
    };
    MessageListener.prototype.send = function (method, event) {
        var msg = {
            event: event,
            method: method,
            originId: this.originId
        };
        try {
            this.source.postMessage(msg, '*');
            this.logger.trace('send message', msg);
        }
        catch (e) {
            this.logger.error("failed to send message", msg);
            return false;
        }
        return true;
    };
    return MessageListener;
}());
exports.MessageListener = MessageListener;
