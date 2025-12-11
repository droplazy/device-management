import { get, post } from './http'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

// 直接按接口文档定义返回结构，不做额外映射
export interface DeviceListResponse {
  timestamp: string
  code: number
  data: {
    total_devices: number
    devices: {
      serial_number: string
      status: string
      location: string
      current_action: string
      traffic_statistics: string
      last_heartbeat: string
      process_name?: string
      process_id?: string
    }[]
  }
}

export interface DeviceDetailResponse {
  timestamp: string
  code: number
  data: {
    serial_number: string
    status: string
    current_action: {
      name: string
      start_time: string
      end_time: string
    }
    next_action: {
      name: string
      start_time: string
      end_time: string
    }
    traffic_statistics: string
    ip: string
  }
}

export const fetchDeviceList = () =>
  get<DeviceListResponse>('/device', {
    params: { serial_number: 'ALL' },
  })

export const fetchDeviceBySerial = (serialNumber: string) =>
  get<DeviceDetailResponse>('/device', {
    params: { serial_number: serialNumber },
  })

export interface SendCommandPayload {
  action: string
  subAction: string
  serialNumbers: string[]
  startTime?: string
  endTime?: string
  remark?: string
}

export const sendDeviceCommand = (payload: SendCommandPayload) => {
  const data: {
    action: string
    sub_action: string
    serial_numbers: string[]
    // start_time: string
    // end_time: string
    remark: string
  } = {
    action: payload.action,
    sub_action: payload.subAction,
    serial_numbers: payload.serialNumbers,
    // 直接使用传入的字符串值，而不调用 formatTimeToISO 函数
    // start_time: payload.startTime ?? '',
    // end_time: payload.endTime ?? '',
    remark: payload.remark ?? '',
  }

  return post('/device/command', {
    timestamp: new Date().toISOString(),
    data,
  })
}


export const addDevice = (serialNumber: string, verificationCode: string) =>
  post(
    '/device/add',
    {
      timestamp: new Date().toISOString(),
      data: {
        serial_number: serialNumber,
        verification_code: verificationCode,
      },
    },
    {
      params: {
        serial_number: serialNumber,
        verification_code: verificationCode,
      },
    },
  )

