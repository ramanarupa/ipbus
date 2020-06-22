"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
exports.initMessageDispatcher = void 0;
var message_dispatcher_1 = require("./message-dispatcher");
__exportStar(require("./originId"), exports);
__exportStar(require("./message-dispatcher"), exports);
__exportStar(require("./message-listener"), exports);
var messageDispatcher;
exports.initMessageDispatcher = function (bus, callback) {
    if (messageDispatcher) {
        messageDispatcher.logger.warn('message dispatcher already up');
    }
    else {
        messageDispatcher = new message_dispatcher_1.MessageDispatcher(bus, callback);
    }
    bus.addDispatcher(messageDispatcher);
    return messageDispatcher;
};
