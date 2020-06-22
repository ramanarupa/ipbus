"use strict";
exports.__esModule = true;
exports.MessageDispatcher = void 0;
var logger_console_1 = require("logger-console");
var message_listener_1 = require("./message-listener");
var validate_1 = require("utils/validate");
var MessageDispatcher = /** @class */ (function () {
    function MessageDispatcher(bus, callback) {
        var _this = this;
        this.listenersById = {};
        this.onMessage = function (e) {
            if (!e || e.data.originId === undefined)
                return false; // unexpected messages send by other apps
            var data = e.data;
            var listener = _this.getListener(data.originId) || _this.createListener(e.source, data.originId, _this.logger);
            if (data.method) {
                _this.logger.trace('received event', data.method, 'for', data.originId);
                switch (data.method) {
                    case "unsubscribe":
                        _this.bus.unsubscribe(data.event.channel, listener);
                        break;
                    case "subscribe":
                        _this.bus.subscribe(data.event.channel, listener);
                        break;
                    case "publish":
                        _this.bus.publish(data.event.channel, data.event.data, listener);
                        break;
                    default:
                        if (_this.callback)
                            return _this.callback(e, listener);
                }
            }
            else if (_this.callback)
                return _this.callback(e, listener);
            e.preventDefault();
            e.stopPropagation();
            return true;
        };
        this.bus = bus;
        this.callback = callback;
        this.logger = new logger_console_1.LoggerConsole('message-bridge', undefined, bus.logger);
        window.addEventListener("message", this.onMessage, false);
        this.logger.info('Message dispatcher was created');
    }
    MessageDispatcher.prototype.onSubscribe = function (channel, sourceListener) {
        var event = {
            channel: channel
        };
        this.getAllListeners().forEach(function (listener) {
            if (listener !== sourceListener) {
                listener.send('subscribe', event);
            }
        });
    };
    MessageDispatcher.prototype.onUnsubscribe = function (channel, sourceListener) {
        var event = {
            channel: channel
        };
        this.getAllListeners().forEach(function (listener) {
            if (listener !== sourceListener) {
                listener.send('unsubscribe', event);
            }
        });
    };
    MessageDispatcher.prototype.createListener = function (source, originId, parentLogger) {
        var listener = this.listenersById[originId];
        validate_1.assertNull(listener, 'Listener with originId ' + originId + ' already exists');
        listener = new message_listener_1.MessageListener(source, originId, parentLogger);
        this.listenersById[originId] = listener;
        return listener;
    };
    MessageDispatcher.prototype.getListener = function (originId) {
        return this.listenersById[originId];
    };
    ;
    MessageDispatcher.prototype.getAllListeners = function () {
        var _this = this;
        return Object.keys(this.listenersById).map(function (k) { return _this.listenersById[k]; });
    };
    return MessageDispatcher;
}());
exports.MessageDispatcher = MessageDispatcher;
