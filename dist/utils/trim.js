"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trim = void 0;
const trim = (str, char) => {
    return str.replace(new RegExp("^[" + char + "]+|[" + char + "]+$", "g"), "");
};
exports.trim = trim;
