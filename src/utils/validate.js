"use strict";
exports.__esModule = true;
exports.assertNull = exports.assertNotNull = void 0;
exports.assertNotNull = function (value, message) {
    if (value === null || value === undefined) {
        throw new Error(message || "assertNotNull failed");
    }
    return value;
};
exports.assertNull = function (value, message) {
    if (value !== null && value !== undefined) {
        throw new Error(message || "assertNull failed");
    }
    return value;
};
