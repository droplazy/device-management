<script setup lang="ts">
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN'
import { actionOptions, subActionOptions, defaultSteps } from '@/data/mock'
import { createProcess } from '@/api/process'
import { useMockData } from '@/config/app'
import type { ProcessStep } from '@/types'

dayjs.locale('zh-cn')

const createEmptyStep = (index: number): ProcessStep => ({
  step: index,
  action: '',
  subAction: '',
  startTime: '',
  endTime: '',
  remark: '',
})

const processName = ref('')
const processRemark = ref('')
const steps = ref<ProcessStep[]>(useMockData ? structuredClone(defaultSteps) : [createEmptyStep(1)])
const datePickerLocale = zhCN
const submitting = ref(false)

const handleAddStep = () => {
  const lastStep = steps.value[steps.value.length - 1]
  const nextIndex = lastStep ? lastStep.step + 1 : 1
  steps.value.push(createEmptyStep(nextIndex))
}

const handleSubmit = async () => {
  console.log('[NewProcessView] handleSubmit called', { 
    processName: processName.value, 
    stepsCount: steps.value.length, 
    useMockData,
    submitting: submitting.value
  })
  
  // 防止重复提交
  if (submitting.value) {
    console.log('[NewProcessView] Already submitting, ignore')
    return
  }
  
  if (!processName.value.trim()) {
    console.log('[NewProcessView] Validation failed: processName is empty')
    message.warning('请输入流程名称')
    return
  }
  if (!steps.value.length) {
    console.log('[NewProcessView] Validation failed: no steps')
    message.warning('请至少添加一个步骤')
    return
  }
  // 验证步骤必填字段
  const invalidStep = steps.value.find(
    (step) =>
      !step.action ||
      !step.subAction ||
      !step.startTime ||
      !step.endTime,
  )
  if (invalidStep) {
    console.log('[NewProcessView] Validation failed: invalid step', invalidStep)
    message.warning('请完善所有步骤的动作、子动作和时间信息')
    return
  }
  
  if (useMockData) {
    console.log('[NewProcessView] Using mock data')
    message.success(`已模拟创建流程《${processName.value}》，共 ${steps.value.length} 个步骤`)
    steps.value = structuredClone(defaultSteps)
    processName.value = ''
    processRemark.value = ''
    return
  }
  
  console.log('[NewProcessView] Starting API call')
  submitting.value = true
  try {
    // 确保 steps.value 是数组，并创建一个新数组副本（处理 Vue 响应式对象）
    let stepsArray: ProcessStep[]
    try {
      if (Array.isArray(steps.value)) {
        // 使用 JSON 序列化/反序列化来确保是真正的数组（去除响应式）
        stepsArray = JSON.parse(JSON.stringify(steps.value))
      } else {
        console.error('[NewProcessView] steps.value is not an array', steps.value, typeof steps.value)
        message.error('步骤数据格式错误，请刷新页面重试')
        return
      }
    } catch (error) {
      console.error('[NewProcessView] Failed to process steps', error, steps.value)
      message.error('步骤数据格式错误，请刷新页面重试')
      return
    }
    
    console.log('[NewProcessView] Calling createProcess API', { 
      processName: processName.value, 
      remark: processRemark.value, 
      stepsCount: stepsArray.length,
      stepsType: Array.isArray(stepsArray) ? 'array' : typeof stepsArray,
      stepsValue: stepsArray,
      stepsValueRaw: steps.value
    })
    
    if (!stepsArray.length) {
      message.warning('请至少添加一个步骤')
      return
    }
    
    const response = await createProcess(processName.value, processRemark.value, stepsArray)
    console.log('[NewProcessView] createProcess response', response)
    
    // 检查响应状态码
    if (response && (response as any).code === 200) {
      message.success(`流程《${processName.value}》已创建，包含 ${steps.value.length} 个步骤`)
      steps.value = [createEmptyStep(1)]
      processName.value = ''
      processRemark.value = ''
    } else {
      const errorMsg = (response as any)?.message || '创建流程失败，请稍后再试'
      console.log('[NewProcessView] API returned error code', (response as any)?.code)
      message.error(errorMsg)
    }
  } catch (error) {
    console.error('[NewProcessView] createProcess error', error)
    const errorMsg = (error as any)?.response?.data?.message || (error as any)?.message || '创建流程失败，请稍后再试'
    message.error(errorMsg)
  } finally {
    submitting.value = false
    console.log('[NewProcessView] handleSubmit completed')
  }
}

const handleDelete = (index: number) => {
  steps.value.splice(index, 1)
  steps.value.forEach((item, idx) => (item.step = idx + 1))
}
</script>

<template>
  <section class="page-card flow-page">
    <div class="page-header">
      <div>
        <h2>新建流程</h2>
        <p class="muted">支持多步骤配置，动作/子动作与时间皆可自定义</p>
      </div>
    </div>


    <a-table
      :data-source="steps"
      :pagination="false"
      :row-key="(record: ProcessStep) => record.step"
    >
      <a-table-column title="步骤" :width="80">
        <template #default="{ index }">
          {{ index + 1 }}
        </template>
      </a-table-column>
      <a-table-column title="动作" :width="140">
        <template #default="{ record }">
          <a-select
            v-model:value="record.action"
            :options="
              actionOptions.map((item) => ({
                label: item,
                value: item,
              }))
            "
            :dropdown-match-select-width="false"
            :dropdown-style="{ minWidth: '120px' }"
            style="width: 100%"
            @change="(value: string) => {
              if (value && subActionOptions[value] && subActionOptions[value].length > 0) {
                record.subAction = subActionOptions[value][0]
              } else {
                record.subAction = ''
              }
            }"
          />
        </template>
      </a-table-column>
      <a-table-column title="子动作" :width="160">
        <template #default="{ record }">
          <a-select
            v-model:value="record.subAction"
            :options="
              (record.action && subActionOptions[record.action]
                ? subActionOptions[record.action]
                : []
              ).map((item) => ({
                label: item,
                value: item,
              }))
            "
            :disabled="!record.action"
            :dropdown-match-select-width="false"
            :dropdown-style="{ minWidth: '150px' }"
            style="width: 100%"
          />
        </template>
      </a-table-column>
      <a-table-column title="开始时间" :width="220">
        <template #default="{ record }">
          <a-time-picker
            v-model:value="record.startTime"
            format="HH:mm:ss"
            style="width: 100%"
          />
        </template>
      </a-table-column>
      <a-table-column title="结束时间" :width="220">
        <template #default="{ record }">
          <a-time-picker
            v-model:value="record.endTime"
            format="HH:mm:ss"
            style="width: 100%"
          />
        </template>
      </a-table-column>
      <a-table-column title="备注">
        <template #default="{ record }">
          <a-input
            v-model:value="record.remark"
            placeholder="填入执行提示，例如：不要辣椒"
          />
        </template>
      </a-table-column>
      <a-table-column title="操作" :width="100">
        <template #default="{ index }">
          <a-button type="link" danger @click="handleDelete(index)">
            删除
          </a-button>
        </template>
      </a-table-column>
    </a-table>

    <div class="add-step-row">
      <a-button type="dashed" size="large" @click="handleAddStep">添加步骤</a-button>
    </div>

    <div class="flow-footer">
      <div class="footer-row">
        <div class="footer-label">流程名称</div>
        <div class="footer-input">
          <a-input v-model:value="processName" placeholder="请输入流程名称" />
        </div>
      </div>
      <div class="footer-row">
        <div class="footer-label">备注</div>
        <div class="footer-input">
          <a-input v-model:value="processRemark" placeholder="请输入备注" />
        </div>
      </div>
      <div class="footer-actions">
        <a-button
          type="primary"
          size="large"
          :loading="submitting"
          :disabled="submitting"
          @click="handleSubmit"
        >
          创建
        </a-button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.flow-page .header-actions {
  gap: 12px;
}

.muted {
  color: #6b7280;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
}

.add-step-row {
  margin: 24px 0;
}

.flow-footer {
  margin-top: 16px;
  padding: 20px;
  border: 1px solid #e6ebf5;
  border-radius: 12px;
  background: #f7f9fc;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 16px;
}

.footer-label {
  font-weight: 600;
  color: #4b5563;
}

.footer-actions {
  text-align: right;
}
</style>

