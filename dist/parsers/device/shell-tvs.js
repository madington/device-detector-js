"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shell_tv_json_1 = __importDefault(require("../../fixtures/regexes/device/shell_tv.json"));
const variable_replacement_1 = require("../../utils/variable-replacement");
const user_agent_1 = require("../../utils/user-agent");
const model_1 = require("../../utils/model");
class ShellTvParser {
    constructor() {
        this.parse = (userAgent) => {
            const result = {
                type: "",
                brand: "",
                model: ""
            };
            if (!this.isShellTv(userAgent))
                return result;
            result.type = "television";
            for (const [brand, shellTv] of Object.entries(shell_tv_json_1.default)) {
                const match = (0, user_agent_1.userAgentParser)(shellTv.regex, userAgent);
                if (!match)
                    continue;
                result.brand = brand;
                result.model = (0, model_1.buildModel)((0, variable_replacement_1.variableReplacement)(shellTv.model, match)).trim();
                break;
            }
            return result;
        };
        this.isShellTv = (userAgent) => {
            return (0, user_agent_1.userAgentParser)("[a-z]+[ _]Shell[ _]\\w{6}|tclwebkit(\\d+[\\.\\d]*)", userAgent);
        };
    }
}
exports.default = ShellTvParser;
