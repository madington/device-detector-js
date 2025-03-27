import { GenericDeviceResult } from "../../typings/device";
export default class ShellTvParser {
    parse: (userAgent: string) => GenericDeviceResult;
    private isShellTv;
}
