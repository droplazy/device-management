import type { ProcessStep } from '@/types';
export interface ProcessListResponse {
    timestamp: string;
    code: number;
    data: {
        process_name: string;
        creation_time: string;
        remark: string;
        process_id: string;
    }[];
}
export interface ProcessStepsResponse {
    timestamp: string;
    code: number;
    data: {
        process_id: string;
        steps: {
            step: number;
            action: string;
            sub_action: string;
            start_time: string;
            end_time: string;
            remark: string;
        }[];
    };
}
export declare const fetchProcessList: () => any;
export declare const fetchProcessSteps: (processId: string) => any;
export declare const createProcess: (steps: ProcessStep[]) => any;
export declare const updateProcess: (processId: string, steps: ProcessStep[]) => any;
export declare const deleteProcesses: (processIds: string[]) => any;
