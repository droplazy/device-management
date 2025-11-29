export interface DeviceListResponse {
    timestamp: string;
    code: number;
    data: {
        total_devices: number;
        devices: {
            serial_number: string;
            status: string;
            location: string;
            current_action: string;
            traffic_statistics: string;
            last_heartbeat: string;
        }[];
    };
}
export interface DeviceDetailResponse {
    timestamp: string;
    code: number;
    data: {
        serial_number: string;
        status: string;
        current_action: {
            name: string;
            start_time: string;
            end_time: string;
        };
        next_action: {
            name: string;
            start_time: string;
            end_time: string;
        };
        traffic_statistics: string;
        ip: string;
    };
}
export declare const fetchDeviceList: () => any;
export declare const fetchDeviceBySerial: (serialNumber: string) => any;
export interface SendCommandPayload {
    action: string;
    subAction: string;
    serialNumbers: string[];
}
export declare const sendDeviceCommand: (payload: SendCommandPayload) => any;
export declare const addDevice: (serialNumber: string, verificationCode: string) => any;
