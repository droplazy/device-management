import type { Device, ProcessStep, ProcessSummary } from '@/types'

export const mockDevices: Device[] = [
  {
    serialNumber: 'SN999321',
    status: '在线',
    location: '杭州',
    currentAction: '吃饭',
    traffic: '56841.12MB',
    lastHeartbeat: '2025-11-21 15:51',
    ip: '192.168.111.222',
    processName: '测试流程1',
    processId: 'P001',
    nextAction: {
      name: '洗澡',
      start: '2025-10-25 14:00:12',
      end: '2025-10-25 14:13:22',
    },
  },
  {
    serialNumber: 'SN999322',
    status: '在线',
    location: '杭州',
    currentAction: '闲置',
    traffic: '56841.12MB',
    lastHeartbeat: '2025-11-22 15:51',
    processName: '测试流程1',
    processId: 'P001',
  },
  {
    serialNumber: 'SN999323',
    status: '在线',
    location: '杭州',
    currentAction: '闲置',
    traffic: '56841.12MB',
    lastHeartbeat: '2025-11-23 15:51',
    processName: '测试流程1',
    processId: 'P001',
  },
  {
    serialNumber: 'SN999324',
    status: '离线',
    location: '杭州',
    currentAction: '闲置',
    traffic: '56841.12MB',
    lastHeartbeat: '2025-11-24 15:51',
    processName: '测试流程2',
    processId: 'P002',
  },
  {
    serialNumber: 'SN999325',
    status: '离线',
    location: '杭州',
    currentAction: '闲置',
    traffic: '56841.12MB',
    lastHeartbeat: '2025-11-25 15:51',
    processName: '测试流程2',
    processId: 'P002',
  },
]

export const defaultSteps: ProcessStep[] = [
  {
    step: 1,
    action: '吃饭',
    subAction: '吃番茄炒蛋',
    startTime: '2025-11-11 12:00',
    endTime: '2025-11-11 13:00',
    remark: '不要辣椒',
  },
  {
    step: 2,
    action: '散步',
    subAction: '去街心公园',
    startTime: '2025-11-11 14:00',
    endTime: '2025-11-11 15:00',
    remark: '去街心公园凉亭',
  },
  {
    step: 3,
    action: '洗澡',
    subAction: '洗头',
    startTime: '2025-11-11 16:00',
    endTime: '2025-11-11 18:00',
  },
  {
    step: 4,
    action: '休息',
    subAction: '休息',
    startTime: '2025-11-11 20:00',
    endTime: '2025-11-11 21:00',
  },
  {
    step: 5,
    action: '吃饭',
    subAction: '吃番茄炒蛋',
    startTime: '2025-11-11 22:00',
    endTime: '2025-11-11 23:00',
  },
]

export const mockProcessList: ProcessSummary[] = [
  {
    processId: 'P001',
    processName: '小明的一天流程安排',
    creationTime: '2025-10-31 12:00:00',
    remark: '临时流程',
  },
  {
    processId: 'P002',
    processName: '小红的一天流程安排',
    creationTime: '2025-10-31 13:00:00',
    remark: '临时流程',
  },
  {
    processId: 'P003',
    processName: '小黄的一天流程安排',
    creationTime: '2025-10-31 14:00:00',
    remark: '临时流程',
  },
  {
    processId: 'P004',
    processName: '小绿的一天流程安排',
    creationTime: '2025-10-31 15:00:00',
    remark: '临时流程',
  },
]

// 动作选项列表（根据实际需求增删）
export const actionOptions = [
  '吃饭',
  '洗澡',
  '散步',
  '看电视',
  '运动',
  '工作',
  '休息',
]

export const subActionOptions: Record<string, string[]> = {
  吃饭: ['吃番茄炒蛋', '吃黄焖鸡米饭', '吃牛肉面'],
  洗澡: ['洗头', '泡澡', '快速冲澡'],
  散步: ['去街心公园', '小区周边', '江边'],
  看电视: ['新闻', '综艺', '纪录片'],
  运动: ['跑步', '瑜伽', '力量训练'],
  工作: ['远程会议', '整理报表', '代码编写'],
  休息: ['午休', '躺平', '闭目养神'],
}

