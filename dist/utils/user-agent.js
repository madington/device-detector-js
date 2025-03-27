"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAgentParser = void 0;
const memory_cache_1 = require("./memory-cache");
const cache = (0, memory_cache_1.memoryCache)();
const getRegexInstance = (rawRegex) => {
    const cachedRegexInstance = cache.get(rawRegex);
    if (cachedRegexInstance)
        return cachedRegexInstance.value;
    const regexInstance = RegExp(`(?:^|[^A-Z0-9\-_]|[^A-Z0-9\-]_|sprd-|MZ-)(?:${rawRegex})`, "i");
    cache.set(rawRegex, {
        value: regexInstance
    });
    return regexInstance;
};
const userAgentParser = (rawRegex, userAgent) => {
    // TODO: find out why it fails in some browsers
    try {
        const regexInstance = getRegexInstance(rawRegex);
        const match = regexInstance.exec(userAgent);
        return match ? match.slice(1) : null;
    }
    catch (_a) {
        return null;
    }
};
exports.userAgentParser = userAgentParser;
