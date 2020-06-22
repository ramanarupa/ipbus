(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('logger-console'), require('utils/validate')) :
    typeof define === 'function' && define.amd ? define(['exports', 'logger-console', 'utils/validate'], factory) :
    (global = global || self, factory(global['message-dispatcher'] = {}, global.loggerConsole, global.validate));
}(this, (function (exports, loggerConsole, validate) { 'use strict';

    function generateOriginId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    var MessageListener = (function () {
        function MessageListener(source, originId, parentLogger) {
            this.source = source;
            this.originId = originId || generateOriginId();
            this.logger = new loggerConsole.LoggerConsole(this.originId, undefined, parentLogger);
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

    var MessageDispatcher = (function () {
        function MessageDispatcher(bus, callback) {
            var _this = this;
            this.listenersById = {};
            this.onMessage = function (e) {
                if (!e || e.data.originId === undefined)
                    return false;
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
            this.logger = new loggerConsole.LoggerConsole('message-bridge', undefined, bus.logger);
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
            validate.assertNull(listener, 'Listener with originId ' + originId + ' already exists');
            listener = new MessageListener(source, originId, parentLogger);
            this.listenersById[originId] = listener;
            return listener;
        };
        MessageDispatcher.prototype.getListener = function (originId) {
            return this.listenersById[originId];
        };
        MessageDispatcher.prototype.getAllListeners = function () {
            var _this = this;
            return Object.keys(this.listenersById).map(function (k) { return _this.listenersById[k]; });
        };
        return MessageDispatcher;
    }());

    var messageDispatcher;
    var initMessageDispatcher = function (bus, callback) {
        if (messageDispatcher) {
            messageDispatcher.logger.warn('message dispatcher already up');
        }
        else {
            messageDispatcher = new MessageDispatcher(bus, callback);
        }
        bus.addDispatcher(messageDispatcher);
        return messageDispatcher;
    };

    exports.MessageDispatcher = MessageDispatcher;
    exports.MessageListener = MessageListener;
    exports.generateOriginId = generateOriginId;
    exports.initMessageDispatcher = initMessageDispatcher;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=message-dispatcher.js.map
