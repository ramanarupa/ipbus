"use strict";
exports.__esModule = true;
exports.generateOriginId = void 0;
function generateOriginId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
exports.generateOriginId = generateOriginId;
