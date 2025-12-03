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
  // 将时间格式从 "YYYY-MM-DD HH:mm" 转换为 ISO 8601 格式 "YYYY-MM-DDTHH:mm:ssZ"
  const formatTimeToISO = (timeStr: string | undefined) => {
    if (!timeStr) return ''
    // 如果已经是 ISO 格式，直接返回
    if (timeStr.includes('T') || timeStr.includes('Z')) return timeStr
    // 否则转换格式：YYYY-MM-DD HH:mm -> YYYY-MM-DDTHH:mm:00Z
    const dateTime = dayjs(timeStr, 'YYYY-MM-DD HH:mm')
    if (!dateTime.isValid()) return timeStr
    // 转换为 UTC 时间并格式化为 ISO 8601（带 Z 后缀表示 UTC）
    return dateTime.utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
  }

  const data: {
    action: string
    sub_action: string
    serial_numbers: string[]
    start_time: string
    end_time: string
    remark: string
  } = {
    action: payload.action,
    sub_action: payload.subAction,
    serial_numbers: payload.serialNumbers,
    start_time: formatTimeToISO(payload.startTime),
    end_time: formatTimeToISO(payload.endTime),
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

