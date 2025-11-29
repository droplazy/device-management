import { get, post } from './http'
import type { ProcessStep } from '@/types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

// 流程列表返回结构
export interface ProcessListResponse {
  timestamp: string
  code: number
  data: {
    process_name: string
    creation_time: string
    remark: string
    process_id: string
  }[]
}

// 单个流程步骤返回结构
export interface ProcessStepsResponse {
  timestamp: string
  code: number
  data: {
    process_id: string
    steps: {
      step: number
      action: string
      sub_action: string
      start_time: string
      end_time: string
      remark: string
    }[]
  }
}

export const fetchProcessList = () =>
  get<ProcessListResponse>('/process/get', {
    params: { process_id: 'ALL' },
  })

export const fetchProcessSteps = (processId: string) =>
  get<ProcessStepsResponse>('/process/get', {
    params: { process_id: processId },
  })

// 下方几个写操作只负责把前端结构改成接口需要的字段名
const mapStepToRaw = (step: ProcessStep) => {
  // 将时间格式从 "YYYY-MM-DD HH:mm" 转换为 ISO 8601 格式 "YYYY-MM-DDTHH:mm:ssZ"
  const formatTimeToISO = (timeStr: string) => {
    if (!timeStr) return ''
    // 如果已经是 ISO 格式，直接返回
    if (timeStr.includes('T') || timeStr.includes('Z')) return timeStr
    // 否则转换格式：YYYY-MM-DD HH:mm -> YYYY-MM-DDTHH:mm:00Z
    // 将本地时间字符串解析为 dayjs 对象（视为本地时间）
    const dateTime = dayjs(timeStr, 'YYYY-MM-DD HH:mm')
    if (!dateTime.isValid()) return timeStr
    // 转换为 UTC 时间并格式化为 ISO 8601（带 Z 后缀表示 UTC）
    return dateTime.utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
  }

  return {
    step: step.step,
    action: step.action,
    sub_action: step.subAction,
    start_time: formatTimeToISO(step.startTime),
    end_time: formatTimeToISO(step.endTime),
    remark: step.remark ?? '',
  }
}

export const createProcess = (
  processName: string,
  remark: string,
  steps: ProcessStep[],
) => {
  // 确保 steps 是数组，并转换为真正的数组（处理 Vue 响应式 Proxy）
  let stepsArray: ProcessStep[]
  try {
    if (Array.isArray(steps)) {
      // 使用 Array.from 或展开运算符确保是真正的数组
      stepsArray = Array.from(steps)
    } else if (steps && typeof steps === 'object' && 'length' in steps) {
      // 如果是类数组对象，转换为数组
      stepsArray = Array.from(steps as any)
    } else {
      console.error('createProcess: steps is not an array', steps, typeof steps)
      throw new Error('步骤数据格式错误：steps 必须是数组')
    }
  } catch (error) {
    console.error('createProcess: Failed to convert steps to array', error, steps)
    throw new Error('步骤数据格式错误：无法处理步骤数据')
  }
  
  // 再次验证
  if (!Array.isArray(stepsArray) || !stepsArray.length) {
    console.error('createProcess: stepsArray is invalid', stepsArray)
    throw new Error('步骤数据格式错误：步骤列表为空或无效')
  }
  
  console.log('createProcess: stepsArray', stepsArray, 'isArray:', Array.isArray(stepsArray), 'hasMap:', typeof stepsArray.map === 'function')
  
  // 确保 stepsArray 有 map 方法
  if (typeof stepsArray.map !== 'function') {
    console.error('createProcess: stepsArray.map is not a function', stepsArray, Object.getPrototypeOf(stepsArray))
    throw new Error('步骤数据格式错误：无法处理步骤数据（map 方法不可用）')
  }
  
  // 使用 Array.prototype.map.call 作为备用方案
  const mappedSteps = Array.isArray(stepsArray) 
    ? stepsArray.map(mapStepToRaw)
    : Array.prototype.map.call(stepsArray, mapStepToRaw)
  
  return post('/process/create', {
    timestamp: new Date().toISOString(),
    data: [
      {
        process_name: processName,
        remark: remark,
        steps: mappedSteps,
      },
    ],
  })
}

export const updateProcess = (processId: string, steps: ProcessStep[]) => {
  // 确保 steps 是数组，并转换为真正的数组（处理 Vue 响应式 Proxy）
  let stepsArray: ProcessStep[]
  try {
    if (Array.isArray(steps)) {
      stepsArray = Array.from(steps)
    } else if (steps && typeof steps === 'object' && 'length' in steps) {
      stepsArray = Array.from(steps as any)
    } else {
      console.error('updateProcess: steps is not an array', steps, typeof steps)
      throw new Error('步骤数据格式错误：steps 必须是数组')
    }
  } catch (error) {
    console.error('updateProcess: Failed to convert steps to array', error, steps)
    throw new Error('步骤数据格式错误：无法处理步骤数据')
  }
  
  if (!Array.isArray(stepsArray) || !stepsArray.length) {
    console.error('updateProcess: stepsArray is invalid', stepsArray)
    throw new Error('步骤数据格式错误：步骤列表为空或无效')
  }
  
  const mappedSteps = Array.isArray(stepsArray) 
    ? stepsArray.map(mapStepToRaw)
    : Array.prototype.map.call(stepsArray, mapStepToRaw)
  
  return post(
    '/process/update',
    {
      timestamp: new Date().toISOString(),
      data: {
        process_id: processId,
        steps: mappedSteps,
      },
    },
    { params: { process_id: processId } },
  )
}

export const deleteProcesses = (processIds: string[]) =>
  post('/process/delete', {
    timestamp: new Date().toISOString(),
    data: {
      process_id: processIds,
    },
  })

