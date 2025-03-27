"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oss_json_1 = __importDefault(require("../../fixtures/regexes/oss.json"));
const version_1 = require("../../utils/version");
const variable_replacement_1 = require("../../utils/variable-replacement");
const user_agent_1 = require("../../utils/user-agent");
const operating_system_json_1 = __importDefault(require("./fixtures/operating-system.json"));
const desktopOsArray = ["AmigaOS", "IBM", "GNU/Linux", "Mac", "Unix", "Windows", "BeOS", "Chrome OS", "Chromium OS"];
const shortOsNames = operating_system_json_1.default.operatingSystem;
const osFamilies = operating_system_json_1.default.osFamilies;
class OperatingSystemParser {
    constructor(options) {
        this.options = {
            versionTruncation: 1
        };
        this.parse = (userAgent) => {
            const result = {
                name: "",
                version: "",
                platform: this.parsePlatform(userAgent)
            };
            for (const operatingSystem of oss_json_1.default) {
                const match = (0, user_agent_1.userAgentParser)(operatingSystem.regex, userAgent);
                if (!match)
                    continue;
                result.name = (0, variable_replacement_1.variableReplacement)(operatingSystem.name, match);
                if ("version" in operatingSystem && operatingSystem.version) {
                    result.version = (0, version_1.formatVersion)((0, variable_replacement_1.variableReplacement)(operatingSystem.version, match), this.options.versionTruncation);
                }
                if ("versions" in operatingSystem && operatingSystem.versions) {
                    for (const version of operatingSystem.versions) {
                        const versionMatch = (0, user_agent_1.userAgentParser)(version.regex, userAgent);
                        if (!versionMatch)
                            continue;
                        result.version = (0, version_1.formatVersion)((0, variable_replacement_1.variableReplacement)(version.version, versionMatch), this.options.versionTruncation);
                        break;
                    }
                }
                if (result.name === "lubuntu") {
                    result.name = "Lubuntu";
                }
                if (result.name === "debian") {
                    result.name = "Debian";
                }
                return result;
            }
            return null;
        };
        this.parsePlatform = (userAgent) => {
            if ((0, user_agent_1.userAgentParser)("arm|aarch64|Apple ?TV|Watch ?OS|Watch1,[12]", userAgent)) {
                return "ARM";
            }
            if ((0, user_agent_1.userAgentParser)("mips", userAgent)) {
                return "MIPS";
            }
            if ((0, user_agent_1.userAgentParser)("sh4", userAgent)) {
                return "SuperH";
            }
            if ((0, user_agent_1.userAgentParser)("64-?bit|WOW64|(?:Intel)?x64|win64|amd64|x86_?64", userAgent)) {
                return "x64";
            }
            if ((0, user_agent_1.userAgentParser)(".+32bit|.+win32|(?:i[0-9]|x)86|i86pc", userAgent)) {
                return "x86";
            }
            return "";
        };
        this.options = Object.assign(Object.assign({}, this.options), options);
    }
}
OperatingSystemParser.getDesktopOsArray = () => desktopOsArray;
OperatingSystemParser.getOsFamily = (osName) => {
    const osShortName = OperatingSystemParser.getOsShortName(osName);
    for (const [osFamily, shortNames] of Object.entries(osFamilies)) {
        if (shortNames.includes(osShortName)) {
            return osFamily;
        }
    }
    return "";
};
OperatingSystemParser.getOsShortName = (osName) => {
    for (const [shortName, name] of Object.entries(shortOsNames)) {
        if (name === osName)
            return shortName;
    }
    return "";
};
exports.default = OperatingSystemParser;
