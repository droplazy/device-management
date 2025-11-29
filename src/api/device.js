import { get, post } from './http';
export const fetchDeviceList = () => get('/device', {
    params: { serial_number: 'ALL' },
});
export const fetchDeviceBySerial = (serialNumber) => get('/device', {
    params: { serial_number: serialNumber },
});
export const sendDeviceCommand = (payload) => post('/device/command', {
    timestamp: new Date().toISOString(),
    data: {
        action: payload.action,
        sub_action: payload.subAction,
        serial_numbers: payload.serialNumbers,
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
