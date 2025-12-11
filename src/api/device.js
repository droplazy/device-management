import { get, post } from './http';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
export const fetchDeviceList = () => get('/device', {
    params: { serial_number: 'ALL' },
});
export const fetchDeviceBySerial = (serialNumber) => get('/device', {
    params: { serial_number: serialNumber },
});
export const sendDeviceCommand = (payload) => post('/device/command', {
    timestamp: new Date().toISOString(), // 使用本地时间的字符串表示，而不是ISO格式
    data: {
        action: payload.action,
        sub_action: payload.subAction,
        serial_numbers: payload.serialNumbers,
        start_time: payload.startTime, // 直接使用传入的 startTime
        end_time: payload.endTime, // 直接使用传入的 endTime
        remark: payload.remark ?? '', // 如果 remark 为 null 或 undefined，使用空字符串
    },
});

export const addDevice = (serialNumber, verificationCode) => post('/device/add', {
    timestamp: new Date().toISOString(),
    data: {
        serial_number: serialNumber,
        verification_code: verificationCode,
    },
}, {
    params: {
        serial_number: serialNumber,
        verification_code: verificationCode,
    },
});
