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
const formatTimeToISO = (timeStr) => {
    if (!timeStr)
        return '';
    if (typeof timeStr === 'string' && (timeStr.includes('T') || timeStr.includes('Z')))
        return timeStr;
    const dateTime = dayjs(timeStr, 'YYYY-MM-DD HH:mm');
    if (!dateTime.isValid())
        return typeof timeStr === 'string' ? timeStr : '';
    return dateTime.utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
};
export const sendDeviceCommand = (payload) => post('/device/command', {
    timestamp: new Date().toISOString(),
    data: {
        action: payload.action,
        sub_action: payload.subAction,
        serial_numbers: payload.serialNumbers,
        start_time: formatTimeToISO(payload.startTime),
        end_time: formatTimeToISO(payload.endTime),
        remark: (payload.remark ?? ''),
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
