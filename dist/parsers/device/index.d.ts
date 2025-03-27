import { GenericDeviceResult } from "../../typings/device";
export type DeviceResult = GenericDeviceResult | null;
export default class ClientParser {
    parse: (userAgent: string) => DeviceResult;
}
