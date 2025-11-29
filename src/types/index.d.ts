export type DeviceStatus = '在线' | '离线';
export interface Device {
    serialNumber: string;
    status: DeviceStatus;
    location: string;
    currentAction: string;
    traffic: string;
    lastHeartbeat: string;
    ip?: string;
    nextAction?: {
        name: string;
        start: string;
        end: string;
    };
}
export interface ProcessStep {
    step: number;
    action: string;
    subAction: string;
    startTime: string;
    endTime: string;
    remark?: string;
}
export interface ProcessSummary {
    processId: string;
    processName: string;
    creationTime: string;
    remark: string;
}
