<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { actionOptions, subActionOptions, mockProcessList, defaultSteps } from '@/data/mock'
import type { ProcessStep, ProcessSummary } from '@/types'
import {
  fetchProcessList,
  fetchProcessSteps,
  updateProcess,
  deleteProcesses,
} from '@/api/process'
import { useMockData } from '@/config/app'

const dataSource = ref<ProcessSummary[]>(useMockData ? mockProcessList : [])
const selected = ref<string[]>([])
const drawerOpen = ref(false)
const activeProcess = ref<ProcessSummary | null>(null)
const editableSteps = ref<ProcessStep[]>([])
const tableLoading = ref(false)
const stepsLoading = ref(false)

const rowSelection = {
  selectedRowKeys: selected,
  onChange: (keys: string[]) => {
    selected.value = keys
  },
}

const mapSummary = (item: {
  process_id: string
  process_name: string
  creation_time: string
  remark: string
}): ProcessSummary => ({
  processId: item.process_id,
  processName: item.process_name,
  creationTime: item.creation_time,
  remark: item.remark,
})

const mapStep = (item: {
  step: number
  action: string
  sub_action: string
  start_time: string
  end_time: string
  remark: string
}): ProcessStep => ({
  step: item.step,
  action: item.action,
  subAction: item.sub_action,
  startTime: item.start_time,
  endTime: item.end_time,
  remark: item.remark,
})

const loadProcessList = async () => {
  if (useMockData) {
    dataSource.value = mockProcessList
    return
  }
  tableLoading.value = true
  try {
    const res = await fetchProcessList()
    dataSource.value = res.data.map(mapSummary)
  } catch (error) {
    message.error('获取流程列表失败')
  } finally {
    tableLoading.value = false
  }
}

onMounted(loadProcessList)

const openProcess = async (record: ProcessSummary) => {
  activeProcess.value = record
  drawerOpen.value = true
  if (useMockData) {
    editableSteps.value = structuredClone(defaultSteps)
    return
  }
  stepsLoading.value = true
  try {
    const res = await fetchProcessSteps(record.processId)
    editableSteps.value = res.data.steps.map(mapStep)
  } catch (error) {
    message.error('获取流程详情失败')
  } finally {
    stepsLoading.value = false
  }
}

const handleDelete = async () => {
  if (useMockData) {
    dataSource.value = dataSource.value.filter(
      (item) => !selected.value.includes(item.processId),
    )
    message.success(`已模拟删除 ${selected.value.length} 条流程`)
    selected.value = []
    return
  }
  try {
    await deleteProcesses(selected.value)
    message.success(`已删除 ${selected.value.length} 条流程`)
    selected.value = []
    loadProcessList()
  } catch (error) {
    message.error('删除流程失败，请稍后重试')
  }
}

const handleSave = async () => {
  if (!activeProcess.value) return
  if (useMockData) {
    message.success('已模拟更新流程')
    drawerOpen.value = false
    return
  }
  try {
    await updateProcess(activeProcess.value.processId, editableSteps.value)
    message.success('流程已更新')
    drawerOpen.value = false
    loadProcessList()
  } catch (error) {
    message.error('更新流程失败')
  }
}

const addStep = () => {
  const nextIndex = editableSteps.value.length + 1
  editableSteps.value.push({
    step: nextIndex,
    action: '',
    subAction: '',
    startTime: '',
    endTime: '',
    remark: '',
  })
}

const removeStep = (index: number) => {
  if (editableSteps.value.length <= 1) {
    message.warning('至少需要保留一个步骤')
    return
  }
  editableSteps.value.splice(index, 1)
  // 重新编号步骤序号
  editableSteps.value.forEach((item, idx) => {
    item.step = idx + 1
  })
  message.success('步骤已删除')
}
</script>

<template>
  <section class="page-card">
    <div class="page-header">
      <div>
        <h2>流程管理</h2>
        <p class="muted">
          支持查看、编辑及批量删除已有流程，点击流程名称进入编辑页
        </p>
      </div>
      <a-popconfirm
        :title="`确定要删除 共${selected.length}条 流程吗？`"
        ok-text="删除"
        cancel-text="取消"
        :disabled="!selected.length"
        @confirm="handleDelete"
      >
        <a-button danger :disabled="!selected.length">删除流程</a-button>
      </a-popconfirm>
    </div>

    <a-table
      :data-source="dataSource"
      :row-key="(record: ProcessSummary) => record.processId"
      :row-selection="rowSelection"
      :pagination="false"
      :loading="tableLoading"
      class="process-table"
    >
      <a-table-column title="流程名称" data-index="processName">
        <template #default="{ record }">
          <a-button type="link" @click="openProcess(record)">
            {{ record.processName }}
          </a-button>
        </template>
      </a-table-column>
      <a-table-column title="创建时间" data-index="creationTime" />
      <a-table-column title="备注" data-index="remark" />
    </a-table>
  </section>

  <a-drawer
    width="640px"
    destroy-on-close
    v-model:open="drawerOpen"
    :title="activeProcess ? `编辑流程 · ${activeProcess.processName}` : '编辑流程'"
  >
    <div class="drawer-actions">
      <a-button type="dashed" @click="addStep">添加步骤</a-button>
      <a-button type="primary" @click="handleSave">保存更新</a-button>
    </div>
    <a-spin :spinning="stepsLoading">
      <a-collapse :bordered="false">
        <a-collapse-panel
          v-for="(step, index) in editableSteps"
          :key="step.step"
          :header="`步骤 ${index + 1} · ${step.action || '未设置'}`"
        >
          <div class="step-header-actions">
            <a-popconfirm
              title="确定要删除这个步骤吗？"
              ok-text="删除"
              cancel-text="取消"
              :disabled="editableSteps.length <= 1"
              @confirm="removeStep(index)"
            >
              <a-button danger size="small" :disabled="editableSteps.length <= 1">
                删除步骤
              </a-button>
            </a-popconfirm>
          </div>
          <div class="step-grid">
            <a-form-item label="动作">
              <a-select
                v-model:value="step.action"
                :options="actionOptions.map((item) => ({ value: item, label: item }))"
                :dropdown-match-select-width="false"
                :dropdown-style="{ minWidth: '120px' }"
                style="width: 100%"
                @change="(value) => {
                  if (value && subActionOptions[value] && subActionOptions[value].length > 0) {
                    step.subAction = subActionOptions[value][0]
                  } else {
                    step.subAction = ''
                  }
                }"
              />
            </a-form-item>
            <a-form-item label="子动作">
              <a-select
                v-model:value="step.subAction"
                :options="
                  (step.action && subActionOptions[step.action]
                    ? subActionOptions[step.action]
                    : []
                  ).map((item) => ({
                    value: item,
                    label: item,
                  }))
                "
                :disabled="!step.action"
                :dropdown-match-select-width="false"
                :dropdown-style="{ minWidth: '150px' }"
                style="width: 100%"
              />
            </a-form-item>
          </div>
          <div class="step-grid">
            <a-form-item label="开始时间">
              <a-date-picker
                v-model:value="step.startTime"
                :show-time="{ format: 'HH:mm' }"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </a-form-item>
            <a-form-item label="结束时间">
              <a-date-picker
                v-model:value="step.endTime"
                :show-time="{ format: 'HH:mm' }"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </a-form-item>
          </div>
          <a-form-item label="备注">
            <a-input v-model:value="step.remark" />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-spin>
  </a-drawer>
</template>

<style scoped>
.muted {
  color: #6b7280;
}

.process-table :deep(.ant-table-thead > tr > th) {
  background: #f7f9fc;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 16px;
}

.step-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.step-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
</style>

