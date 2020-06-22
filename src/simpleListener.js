"use strict";
exports.__esModule = true;
exports.SimpleListener = void 0;
var SimpleListener = /** @class */ (function () {
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
    ;
    return SimpleListener;
}());
exports.SimpleListener = SimpleListener;
