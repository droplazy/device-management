<script setup lang="ts">
import { computed, reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  actionOptions,
  subActionOptions,
  mockProcessList,
} from '@/data/mock'
import {
  fetchDeviceList,
  fetchDeviceBySerial,
  addDevice as apiAddDevice,
  sendDeviceCommand,
  type DeviceListResponse,
  type DeviceDetailResponse,
} from '@/api/device'
import { assignProcessToDevice, fetchProcessList } from '@/api/process'
import { useMockData } from '@/config/app'
import { mockDevices } from '@/data/mock'
import type { Device } from '@/types'

const devices = ref<Device[]>(useMockData ? mockDevices : [])
const keyword = ref('')
const selectedKeys = ref<string[]>([])
const tableLoading = ref(false)
const detailLoading = ref(false)
const processOptions = ref<{ label: string; value: string }[]>([])
const processLoading = ref(false)
const processBindingSerial = ref('')

const isAddDeviceOpen = ref(false)
const isCommandOpen = ref(false)
const isDetailOpen = ref(false)
const detailRecord = ref<Device | null>(null)
const detailSerialNumber = ref('')
const currentActionDetail = ref<{
  name: string
  start: string
  end: string
} | null>(null)

const addDeviceForm = reactive({
  serialNumber: '',
  verificationCode: '',
})

const commandForm = reactive({
  action: actionOptions[0],
  subAction: subActionOptions[actionOptions[0]][0],
  start: dayjs().add(30, 'minute'),
  end: dayjs().add(90, 'minute'),
  remark: '',
})

const mapDevice = (
  item: DeviceListResponse['data']['devices'][number],
): Device => ({
  serialNumber: item.serial_number,
  status: item.status as Device['status'],
  location: item.location,
  currentAction: item.current_action,
  traffic: item.traffic_statistics,
  lastHeartbeat: item.last_heartbeat,
  processName: item.process_name,
  processId: item.process_id,
})

const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return ' - '
  // 如果是 ISO 格式，转换为 YYYY-MM-DD HH:mm:ss
  const date = new Date(dateTimeStr)
  if (isNaN(date.getTime())) return dateTimeStr
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const mapDeviceDetail = (
  data: DeviceDetailResponse['data'],
  baseRecord: Device | null,
) => {
  currentActionDetail.value = {
    name: data.current_action.name,
    start: formatDateTime(data.current_action.start_time),
    end: formatDateTime(data.current_action.end_time),
  }
  return {
    serialNumber: data.serial_number || baseRecord?.serialNumber || '',
    status: data.status as Device['status'],
    location: baseRecord?.location || '',
    currentAction: data.current_action.name,
    traffic: data.traffic_statistics,
    lastHeartbeat: baseRecord?.lastHeartbeat || '',
    ip: data.ip,
    nextAction: {
      name: data.next_action.name,
      start: formatDateTime(data.next_action.start_time),
      end: formatDateTime(data.next_action.end_time),
    },
  }
}

const loadDevices = async () => {
  if (useMockData) {
    devices.value = mockDevices
    return
  }
  tableLoading.value = true
  try {
    const res = await fetchDeviceList()
    devices.value = res.data.devices.map(mapDevice)
  } catch (error) {
    message.error('获取设备列表失败')
  } finally {
    tableLoading.value = false
  }
}

const loadProcessOptions = async () => {
  if (useMockData) {
    processOptions.value = mockProcessList.map((item) => ({
      label: item.processName,
      value: item.processId,
    }))
    return
  }

  processLoading.value = true
  try {
    const res = await fetchProcessList()
    processOptions.value = res.data.map((item) => ({
      label: item.process_name,
      value: item.process_id,
    }))
  } catch (error) {
    message.error('获取流程列表失败')
  } finally {
    processLoading.value = false
  }
}

let devicesRefreshTimer: ReturnType<typeof setInterval> | null = null
let processRefreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  loadDevices()
  loadProcessOptions()

  devicesRefreshTimer = setInterval(() => {
    if (!tableLoading.value) {
      loadDevices()
    }
  }, 3000)

  processRefreshTimer = setInterval(() => {
    if (!processLoading.value) {
      loadProcessOptions()
    }
  }, 10000)
})

onBeforeUnmount(() => {
  if (devicesRefreshTimer) {
    clearInterval(devicesRefreshTimer)
    devicesRefreshTimer = null
  }
  if (processRefreshTimer) {
    clearInterval(processRefreshTimer)
    processRefreshTimer = null
  }
})

const filteredDevices = computed(() =>
  devices.value.filter((item) =>
    item.serialNumber.toLowerCase().includes(keyword.value.toLowerCase()),
  ),
)

const onlineCount = computed(
  () => filteredDevices.value.filter((d) => d.status === '在线').length,
)

const rowSelection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  },
  getCheckboxProps: (record: Device) => ({
    disabled: record.status === '离线',
  }),
}))

const handleRefresh = () => {
  loadDevices()
}

const openDetail = async (record: Device) => {
  detailRecord.value = record
  detailSerialNumber.value = record.serialNumber
  currentActionDetail.value = null
  isDetailOpen.value = true
  if (useMockData) {
    // 模拟当前动作详情
    currentActionDetail.value = {
      name: record.currentAction,
      start: '2025-10-25 12:00:12',
      end: '2025-10-25 13:13:22',
    }
    return
  }
  detailLoading.value = true
  try {
    const res = await fetchDeviceBySerial(record.serialNumber)
    detailRecord.value = {
      ...record,
      ...mapDeviceDetail(res.data, record),
    }
  } catch (error) {
    message.error('获取设备详情失败，请稍后重试')
  } finally {
    detailLoading.value = false
  }
}

const handleStopAll = async () => {
  if (!detailRecord.value) {
    return
  }

  if (useMockData) {
    message.success(`已模拟停止设备 ${detailRecord.value.serialNumber} 的所有操作`)
    return
  }

  try {
    await sendDeviceCommand({
      action: 'Terminate',
      subAction: 'Terminate',
      serialNumbers: [detailRecord.value.serialNumber],
    })
    message.success('停止所有操作成功')
    // 刷新设备详情
    handleRefreshDetail()
  } catch (error) {
    message.error('停止所有操作失败，请稍后重试')
  }
}

const handleRefreshDetail = async () => {
  const serial =
    detailRecord.value?.serialNumber || detailSerialNumber.value || ''
  if (!serial) {
    message.warning('无法刷新，缺少设备序列号')
    return
  }

  if (useMockData) {
    // 模拟刷新
    currentActionDetail.value = {
      name: detailRecord.value.currentAction,
      start: '2025-10-25 12:00:12',
      end: '2025-10-25 13:13:22',
    }
    message.success('已模拟刷新设备详情')
    return
  }

  detailLoading.value = true
  try {
    const baseRecord = detailRecord.value
    const res = await fetchDeviceBySerial(serial)
    detailRecord.value = {
      ...(baseRecord || { serialNumber: serial }),
      ...mapDeviceDetail(res.data, baseRecord || null),
      serialNumber: serial,
    }
    message.success('刷新成功')
  } catch (error) {
    message.error('刷新设备详情失败，请稍后重试')
  } finally {
    detailLoading.value = false
  }
}

const handleAddDevice = async () => {
  if (useMockData) {
    message.success(`已模拟添加设备 ${addDeviceForm.serialNumber}`)
    isAddDeviceOpen.value = false
    addDeviceForm.serialNumber = ''
    addDeviceForm.verificationCode = ''
    return
  }
  try {
    await apiAddDevice(addDeviceForm.serialNumber, addDeviceForm.verificationCode)
    message.success(`设备 ${addDeviceForm.serialNumber} 添加成功`)
    isAddDeviceOpen.value = false
    addDeviceForm.serialNumber = ''
    addDeviceForm.verificationCode = ''
    loadDevices()
  } catch (error) {
    message.error('添加设备失败，请检查输入信息')
  }
}

const handleSendCommand = async () => {
  if (!selectedKeys.value.length) {
    message.warning('请至少选择一台在线设备')
    return
  }
  if (!commandForm.start || !commandForm.end) {
    message.warning('请选择开始时间和结束时间')
    return
  }
  if (useMockData) {
    message.success('已模拟下发指令')
    isCommandOpen.value = false
    return
  }
  try {
    await sendDeviceCommand({
      action: commandForm.action,
      subAction: commandForm.subAction,
      serialNumbers: selectedKeys.value,
      startTime: commandForm.start,
      endTime: commandForm.end,
      remark: commandForm.remark,
    })
    message.success('指令已推送到选中设备')
    isCommandOpen.value = false
  } catch (error) {
    message.error('下发指令失败，请稍后再试')
  }
}

const handleActionChange = (action: string) => {
  commandForm.action = action
  commandForm.subAction = subActionOptions[action][0]
}

const handleProcessSelect = async (serialNumber: string, processId?: string) => {
  const target = devices.value.find((item) => item.serialNumber === serialNumber)
  if (!target) return

  if (!processId) {
    target.processId = ''
    target.processName = ''
    message.info(`设备 ${serialNumber} 已清空使用流程`)
    return
  }

  const option = processOptions.value.find((opt) => opt.value === processId)
  const processName = option?.label || ''

  if (!processName) {
    message.warning('无法识别选择的流程，请刷新后重试')
    return
  }

  target.processId = processId
  target.processName = processName

  if (useMockData) {
    message.success(`已模拟将流程《${processName}》应用到设备 ${serialNumber}`)
    return
  }

  processBindingSerial.value = serialNumber
  try {
    await assignProcessToDevice(processId, processName, serialNumber)
    message.success(`设备 ${serialNumber} 已切换为流程《${processName}》`)
  } catch (error) {
    message.error('绑定流程失败，请稍后重试')
    // 回滚
    target.processId = ''
    target.processName = ''
  } finally {
    processBindingSerial.value = ''
  }
}
</script>

<template>
  <section class="page-card">
    <div class="page-header">
      <div>
        <h2>设备列表</h2>
        <p class="muted">
          支持搜索、批量下发指令、实时查看心跳与流量统计
        </p>
      </div>
      <div class="header-actions">
        <a-input-search
          v-model:value="keyword"
          placeholder="按序列号搜索设备 SN999321"
          style="width: 280px"
          allow-clear
        />
        <a-button @click="handleRefresh">刷新</a-button>
        <a-button type="default" @click="isAddDeviceOpen = true">
          添加设备
        </a-button>
        <a-button
          type="primary"
          :disabled="!selectedKeys.length"
          @click="isCommandOpen = true"
        >
          下发指令
        </a-button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <p>监控设备</p>
        <strong>{{ filteredDevices.length }}</strong>
        <small>总量：{{ devices.length }} 台</small>
      </div>
      <div class="stat-card online">
        <p>在线设备</p>
        <strong>{{ onlineCount }}</strong>
        <small>离线：{{ filteredDevices.length - onlineCount }} 台</small>
      </div>
      <div class="stat-card">
        <p>选中设备</p>
        <strong>{{ selectedKeys.length }}</strong>
        <small>下发指令会自动排除离线设备</small>
      </div>
    </div>

    <a-table
      :data-source="filteredDevices"
      :row-key="(record: Device) => record.serialNumber"
      :pagination="false"
      :row-selection="rowSelection"
      :loading="tableLoading"
      class="device-table"
    >
      <a-table-column
        title="序列号"
        key="serialNumber"
        data-index="serialNumber"
      >
        <template #default="{ record }">
          <a-button type="link" @click="openDetail(record)">
            {{ record.serialNumber }}
          </a-button>
        </template>
      </a-table-column>
      <a-table-column title="状态" data-index="status" />
      <a-table-column title="所在地" data-index="location" />
      <a-table-column title="当前动作" data-index="currentAction" />
      <a-table-column title="流量统计" data-index="traffic" />
      <a-table-column title="最后一次心跳" data-index="lastHeartbeat" />
      <a-table-column title="使用流程" key="process">
        <template #default="{ record }">
          <a-select
            :value="record.processId || undefined"
            placeholder="请选择流程"
            style="min-width: 180px"
            :options="processOptions"
            :loading="processLoading || processBindingSerial === record.serialNumber"
            option-label-prop="label"
            allow-clear
            @change="(value) => handleProcessSelect(record.serialNumber, value as string | undefined)"
          >
            <template v-if="!processOptions.length" #notFoundContent>
              <span>暂无流程，请先创建</span>
            </template>
          </a-select>
        </template>
      </a-table-column>
    </a-table>
  </section>

  <a-modal
    title="添加设备"
    v-model:open="isAddDeviceOpen"
    ok-text="添加"
    cancel-text="取消"
    @ok="handleAddDevice"
  >
    <a-form :model="addDeviceForm" layout="vertical">
      <a-form-item label="序列号" required>
        <a-input
          v-model:value="addDeviceForm.serialNumber"
          placeholder="SN999327"
        />
      </a-form-item>
      <a-form-item label="校验码" required>
        <a-input
          v-model:value="addDeviceForm.verificationCode"
          placeholder="123456"
        />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    title="批量下发指令"
    v-model:open="isCommandOpen"
    ok-text="开始执行"
    cancel-text="取消"
    @ok="handleSendCommand"
  >
    <p class="muted">
      当前共选择 {{ selectedKeys.length }} 台设备，系统已自动排除离线设备
    </p>
    <a-form :model="commandForm" layout="vertical">
      <a-form-item label="动作" required>
        <a-select
          v-model:value="commandForm.action"
          :options="actionOptions.map((item) => ({ label: item, value: item }))"
          :dropdown-match-select-width="false"
          :dropdown-style="{ minWidth: '120px' }"
          @change="handleActionChange"
        />
      </a-form-item>
      <a-form-item label="子动作" required>
        <a-select
          v-model:value="commandForm.subAction"
          :options="
            subActionOptions[commandForm.action].map((item) => ({
              label: item,
              value: item,
            }))
          "
          :dropdown-match-select-width="false"
          :dropdown-style="{ minWidth: '150px' }"
        />
      </a-form-item>
      <div class="time-grid">
        <a-form-item label="开始时间" required>
          <a-date-picker
            v-model:value="commandForm.start"
            :show-time="{ format: 'HH:mm' }"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="结束时间" required>
          <a-date-picker
            v-model:value="commandForm.end"
            :show-time="{ format: 'HH:mm' }"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </a-form-item>
      </div>
      <a-form-item label="备注">
        <a-textarea
          v-model:value="commandForm.remark"
          rows="3"
          placeholder="请输入备注"
        />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:open="isDetailOpen"
    title=""
    :footer="null"
    width="600px"
    :destroy-on-close="true"
    centered
  >
    <a-spin :spinning="detailLoading">
      <div v-if="detailRecord" class="device-detail-modal">
        <!-- 头部：序列号和状态 -->
        <div class="detail-header">
          <div class="detail-serial">{{ detailRecord.serialNumber }}</div>
          <div class="detail-status">{{ detailRecord.status }}</div>
        </div>

        <!-- 当前动作 -->
        <div class="detail-row">
          <div class="detail-label">当前动作</div>
          <div class="detail-value">{{ currentActionDetail?.name || detailRecord.currentAction }}</div>
          <div class="detail-time">
            开始:{{ currentActionDetail?.start || ' - ' }}
          </div>
          <div class="detail-time">
            结束:{{ currentActionDetail?.end || ' - ' }}
          </div>
        </div>

        <!-- 下一动作 -->
        <div class="detail-row">
          <div class="detail-label">下一动作</div>
          <div class="detail-value">{{ detailRecord.nextAction?.name || ' - ' }}</div>
          <div class="detail-time">
            开始:{{ detailRecord.nextAction?.start || ' - ' }}
          </div>
          <div class="detail-time">
            结束:{{ detailRecord.nextAction?.end || ' - ' }}
          </div>
        </div>

        <!-- IP地址 -->
        <div class="detail-row">
          <div class="detail-label">IP</div>
          <div class="detail-value-full">{{ detailRecord.ip || ' - ' }}</div>
        </div>

        <!-- 流量统计 -->
        <div class="detail-row">
          <div class="detail-label">流量统计</div>
          <div class="detail-value-full">{{ detailRecord.traffic }}</div>
        </div>

        <!-- 底部按钮 -->
        <div class="detail-actions">
          <div class="detail-location">{{ detailRecord.location }}</div>
          <a-button danger ghost @click="handleStopAll">停止所有</a-button>
          <a-button type="primary" @click="handleRefreshDetail">刷新</a-button>
          <a-button @click="isDetailOpen = false">退出</a-button>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.muted {
  color: #6b7280;
  margin: 4px 0 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border: 1px solid #eff2f7;
  border-radius: 12px;
  padding: 16px;
  background: #fdfdfd;
}

.stat-card online,
.stat-card.online {
  background: #f1f8ff;
}

.stat-card p {
  margin: 0 0 8px 0;
  color: #6b7280;
}

.stat-card strong {
  font-size: 24px;
  display: block;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.device-table :deep(.ant-table-thead > tr > th) {
  background: #f7f9fc;
}

.device-detail-modal {
  padding: 8px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e5e8ef;
  margin-bottom: 16px;
}

.detail-serial {
  font-size: 18px;
  font-weight: 600;
  color: #1f2633;
}

.detail-status {
  font-size: 14px;
  color: #1677ff;
  font-weight: 500;
}

.detail-row {
  display: grid;
  grid-template-columns: 100px 1fr 1fr 1fr;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.detail-row:last-of-type {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #1f2633;
  font-size: 14px;
}

.detail-value {
  color: #1f2633;
  font-size: 14px;
}

.detail-value-full {
  grid-column: 2 / -1;
  color: #1f2633;
  font-size: 14px;
}

.detail-time {
  color: #6b7280;
  font-size: 13px;
}

.detail-actions {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 12px;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e8ef;
}

.detail-location {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.inline-status-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.inline-status-bar .status-chip {
  padding: 6px 18px;
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>

