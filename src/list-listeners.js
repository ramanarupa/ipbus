"use strict";
exports.__esModule = true;
exports.ListListeners = void 0;
var ListListeners = /** @class */ (function () {
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
exports.ListListeners = ListListeners;
