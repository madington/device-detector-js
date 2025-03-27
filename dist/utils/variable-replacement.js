"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variableReplacement = void 0;
const variableReplacement = (template, variables) => {
    const regex = new RegExp(`\\$\\d`, "g");
    if (template === null || template === undefined)
        return "";
    return template.replace(regex, (match) => {
        const index = parseInt(match.substr(1), 10);
        const variable = variables[index - 1];
        return variable || "";
    });
};
exports.variableReplacement = variableReplacement;
