"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const client_1 = __importDefault(require("./parsers/client"));
const device_1 = __importDefault(require("./parsers/device"));
const operating_system_1 = __importDefault(require("./parsers/operating-system"));
const vendor_fragment_1 = __importDefault(require("./parsers/vendor-fragment"));
const browser_1 = __importDefault(require("./parsers/client/browser"));
const BotParser = require("./parsers/bot");
const user_agent_1 = require("./utils/user-agent");
const version_compare_1 = require("./utils/version-compare");
class DeviceDetector {
    constructor(options) {
        // Default options
        this.options = {
            skipBotDetection: false,
            versionTruncation: 1
        };
        this.parse = (userAgent) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
            const result = {
                client: this.clientParser.parse(userAgent),
                os: this.operatingSystemParser.parse(userAgent),
                device: this.deviceParser.parse(userAgent),
                bot: this.options.skipBotDetection ? null : this.botParser.parse(userAgent)
            };
            const osName = (_a = result.os) === null || _a === void 0 ? void 0 : _a.name;
            const osFamily = operating_system_1.default.getOsFamily(osName || "");
            const osVersion = (_b = result.os) === null || _b === void 0 ? void 0 : _b.version;
            const appleOsNames = ["iPadOS", "tvOS", "watchOS", "iOS", "Mac"];
            /**
             * if it's fake UA then it's best not to identify it as Apple running Android OS or GNU/Linux
             */
            if (((_c = result.device) === null || _c === void 0 ? void 0 : _c.brand) === "Apple" && !appleOsNames.includes(osName || "")) {
                result.device.type = "";
                result.device.brand = "";
                result.device.model = "";
            }
            if (!((_d = result.device) === null || _d === void 0 ? void 0 : _d.brand)) {
                const brand = this.vendorFragmentParser.parse(userAgent);
                if (brand) {
                    if (!result.device) {
                        result.device = this.createDeviceObject();
                    }
                    result.device.brand = brand;
                }
            }
            /**
             * Assume all devices running iOS / Mac OS are from Apple
             */
            if (!((_e = result.device) === null || _e === void 0 ? void 0 : _e.brand) && appleOsNames.includes(osName || "")) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.brand = "Apple";
            }
            /**
             * All devices containing VR fragment are assumed to be a wearable
             */
            if (!((_f = result.device) === null || _f === void 0 ? void 0 : _f.type) && this.hasAndroidVRFragment(userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "wearable";
            }
            /**
             * Chrome on Android passes the device type based on the keyword 'Mobile'
             * If it is present the device should be a smartphone, otherwise it's a tablet
             * See https://developer.chrome.com/multidevice/user-agent#chrome_for_android_user_agent
             * Note: We do not check for browser (family) here, as there might be mobile apps using Chrome, that won't have
             *       a detected browser, but can still be detected. So we check the useragent for Chrome instead.
             */
            if (!((_g = result.device) === null || _g === void 0 ? void 0 : _g.type) && osFamily === "Android" && (0, user_agent_1.userAgentParser)("Chrome/[\\.0-9]*", userAgent)) {
                if ((0, user_agent_1.userAgentParser)("(?:Mobile|eliboM)", userAgent)) {
                    if (!result.device) {
                        result.device = this.createDeviceObject();
                    }
                    result.device.type = "smartphone";
                }
                else {
                    if (!result.device) {
                        result.device = this.createDeviceObject();
                    }
                    result.device.type = "tablet";
                }
            }
            /**
             * Some user agents contain the fragment 'Pad/APad', so we assume those devices as tablets
             */
            if (((_h = result.device) === null || _h === void 0 ? void 0 : _h.type) === "smartphone" && (0, user_agent_1.userAgentParser)("Pad/APad", userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "tablet";
            }
            /**
             * Some user agents simply contain the fragment 'Android; Tablet;' or 'Opera Tablet', so we assume those devices are tablets
             */
            if (!((_j = result.device) === null || _j === void 0 ? void 0 : _j.type) && this.hasAndroidTabletFragment(userAgent) || (0, user_agent_1.userAgentParser)("Opera Tablet", userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "tablet";
            }
            /**
             * Some user agents simply contain the fragment 'Android; Mobile;', so we assume those devices are smartphones
             */
            if (!((_k = result.device) === null || _k === void 0 ? void 0 : _k.type) && this.hasAndroidMobileFragment(userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "smartphone";
            }
            /**
             * Android up to 3.0 was designed for smartphones only. But as 3.0, which was tablet only, was published
             * too late, there were a bunch of tablets running with 2.x
             * With 4.0 the two trees were merged and it is for smartphones and tablets
             *
             * So were are expecting that all devices running Android < 2 are smartphones
             * Devices running Android 3.X are tablets. Device type of Android 2.X and 4.X+ are unknown
             */
            if (!((_l = result.device) === null || _l === void 0 ? void 0 : _l.type) && osName === "Android" && osVersion !== "") {
                if ((0, version_compare_1.versionCompare)(osVersion, "2.0") === -1) {
                    if (!result.device) {
                        result.device = this.createDeviceObject();
                    }
                    result.device.type = "smartphone";
                }
                else if ((0, version_compare_1.versionCompare)(osVersion, "3.0") >= 0 && (0, version_compare_1.versionCompare)(osVersion, "4.0") === -1) {
                    if (!result.device) {
                        result.device = this.createDeviceObject();
                    }
                    result.device.type = "tablet";
                }
            }
            /**
             * All detected feature phones running android are more likely smartphones
             */
            if (((_m = result.device) === null || _m === void 0 ? void 0 : _m.type) === "feature phone" && osFamily === "Android") {
                result.device.type = "smartphone";
            }
            /**
             * All unknown devices under running Java ME are more likely a features phones
             */
            if (osName === "Java ME" && !result.device) {
                result.device = this.createDeviceObject();
                result.device.type = "feature phone";
            }
            /**
             * According to http://msdn.microsoft.com/en-us/library/ie/hh920767(v=vs.85).aspx
             * Internet Explorer 10 introduces the "Touch" UA string token. If this token is present at the end of the
             * UA string, the computer has touch capability, and is running Windows 8 (or later).
             * This UA string will be transmitted on a touch-enabled system running Windows 8 (RT)
             *
             * As most touch enabled devices are tablets and only a smaller part are desktops/notebooks we assume that
             * all Windows 8 touch devices are tablets.
             */
            if (!((_o = result.device) === null || _o === void 0 ? void 0 : _o.type)
                && this.isToucheEnabled(userAgent)
                && (osName === "Windows RT"
                    || (osName === "Windows"
                        && (0, version_compare_1.versionCompare)(osVersion, "8.0") >= 0))) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "tablet";
            }
            /**
             * Early return for PlayStation devices
             */
            if ((0, user_agent_1.userAgentParser)("PlayStation [345]", userAgent)) {
                return result;
            }
            /**
             * All devices running Puffin Secure Browser that contain letter 'D' are assumed to be desktops
             */
            if (!((_p = result.device) === null || _p === void 0 ? void 0 : _p.type) && (0, user_agent_1.userAgentParser)("Puffin/(?:\\d+[.\\d]+)[LMW]D", userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "desktop";
            }
            /**
             * All devices running Puffin Web Browser that contain letter 'P' are assumed to be smartphones
             */
            if (!((_q = result.device) === null || _q === void 0 ? void 0 : _q.type) && (0, user_agent_1.userAgentParser)("Puffin/(?:\\d+[.\\d]+)[AIFLW]P", userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "smartphone";
            }
            /**
             * All devices running Puffin Web Browser that contain letter 'T' are assumed to be tablets
             */
            if (!((_r = result.device) === null || _r === void 0 ? void 0 : _r.type) && (0, user_agent_1.userAgentParser)("Puffin/(?:\\d+[.\\d]+)[AILW]T", userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "tablet";
            }
            /**
             * All devices running Opera TV Store are assumed to be televisions
             */
            if ((0, user_agent_1.userAgentParser)("Opera TV Store| OMI/", userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "television";
            }
            /**
             * All devices that contain Andr0id in string are assumed to be a tv
             */
            if ((0, user_agent_1.userAgentParser)("Andr0id|(?:Android(?: UHD)?|Google) TV|\\(lite\\) TV|BRAVIA| TV$", userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "television";
            }
            /**
             * All devices running Tizen TV or SmartTV are assumed to be televisions
             */
            if ((0, user_agent_1.userAgentParser)("SmartTV|Tizen.+ TV .+$", userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "television";
            }
            /**
             * Devices running those clients are assumed to be televisions
             */
            if (!((_s = result.device) === null || _s === void 0 ? void 0 : _s.type) && ["Kylo", "Espial TV Browser", "LUJO TV Browser", "LogicUI TV Browser", "Open TV Browser", "Seraphic Sraf",
                "Opera Devices", "Crow Browser", "Vewd Browser", "TiviMate", "Quick Search TV", "QJY TV Browser", "TV Bro"].includes(((_t = result.client) === null || _t === void 0 ? void 0 : _t.name) || "")) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "television";
            }
            /**
             * All devices containing TV fragment are assumed to be a tv
             */
            if (!((_u = result.device) === null || _u === void 0 ? void 0 : _u.type) && (0, user_agent_1.userAgentParser)("\\(TV;", userAgent)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "television";
            }
            /**
             * Set device type to desktop if string ua contains desktop
             */
            const hasDesktop = "desktop" !== ((_v = result.device) === null || _v === void 0 ? void 0 : _v.type)
                && null !== (0, user_agent_1.userAgentParser)("Desktop", userAgent)
                && this.hasDesktopFragment(userAgent);
            if (hasDesktop) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "desktop";
            }
            // set device type to desktop for all devices running a desktop os that were not detected as an other device type
            if (!((_w = result.device) === null || _w === void 0 ? void 0 : _w.type) && this.isDesktop(result, osFamily)) {
                if (!result.device) {
                    result.device = this.createDeviceObject();
                }
                result.device.type = "desktop";
            }
            return result;
        };
        this.hasAndroidMobileFragment = (userAgent) => {
            return (0, user_agent_1.userAgentParser)("Android( [\\.0-9]+)?; Mobile;|.*\\-mobile$", userAgent);
        };
        this.hasAndroidTabletFragment = (userAgent) => {
            return (0, user_agent_1.userAgentParser)("Android( [\\.0-9]+)?; Tablet;|Tablet(?! PC)|.*\\-tablet$", userAgent);
        };
        this.hasAndroidVRFragment = (userAgent) => {
            return (0, user_agent_1.userAgentParser)("Android( [\\.0-9]+)?; Mobile VR;| VR", userAgent);
        };
        this.hasDesktopFragment = (userAgent) => {
            return (0, user_agent_1.userAgentParser)("Desktop(?: (x(?:32|64)|WOW64))?;", userAgent);
        };
        this.isDesktop = (result, osFamily) => {
            if (!result.os) {
                return false;
            }
            // Check for browsers available for mobile devices only
            if (this.usesMobileBrowser(result.client)) {
                return false;
            }
            return operating_system_1.default.getDesktopOsArray().includes(osFamily);
        };
        this.usesMobileBrowser = (client) => {
            if (!client)
                return false;
            return (client === null || client === void 0 ? void 0 : client.type) === "browser" && browser_1.default.isMobileOnlyBrowser(client === null || client === void 0 ? void 0 : client.name);
        };
        this.isToucheEnabled = (userAgent) => {
            return (0, user_agent_1.userAgentParser)("Touch", userAgent);
        };
        this.createDeviceObject = () => ({
            type: "",
            brand: "",
            model: ""
        });
        this.options = Object.assign(Object.assign({}, this.options), options);
        this.clientParser = new client_1.default(this.options);
        this.deviceParser = new device_1.default();
        this.operatingSystemParser = new operating_system_1.default(this.options);
        this.vendorFragmentParser = new vendor_fragment_1.default();
        this.botParser = new BotParser();
    }
}
module.exports = DeviceDetector;
