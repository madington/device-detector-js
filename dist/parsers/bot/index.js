"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const bots_json_1 = __importDefault(require("../../fixtures/regexes/bots.json"));
const user_agent_1 = require("../../utils/user-agent");
class BotParser {
    constructor() {
        this.parse = (userAgent) => {
            var _a, _b;
            for (const bot of bots_json_1.default) {
                const match = (0, user_agent_1.userAgentParser)(bot.regex, userAgent);
                if (!match)
                    continue;
                return {
                    name: bot.name,
                    category: bot.category || "",
                    url: bot.url || "",
                    producer: {
                        name: ((_a = bot === null || bot === void 0 ? void 0 : bot.producer) === null || _a === void 0 ? void 0 : _a.name) || "",
                        url: ((_b = bot === null || bot === void 0 ? void 0 : bot.producer) === null || _b === void 0 ? void 0 : _b.url) || ""
                    }
                };
            }
            return null;
        };
    }
}
module.exports = BotParser;
