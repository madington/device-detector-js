"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildModel = void 0;
const buildModel = (model) => {
    model = model.replace(/_/g, " ");
    model = model.replace(RegExp(" TD$", "i"), "");
    if (model === "Build")
        return "";
    return model;
};
exports.buildModel = buildModel;
