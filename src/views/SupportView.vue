<script setup lang="ts">
import { message } from 'ant-design-vue'
import {
  QqOutlined,
  WechatOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons-vue'

// 技术支持联系方式（可更改）

const contacts = [
  { label: 'QQ', value: '123456789', icon: 'qq' },
  { label: '微信', value: 'THISIS_WECHAT', icon: 'wechat' },
  { label: '电话', value: '181-666-8881', icon: 'phone' },
  { label: 'Email', value: 'zxcv_qqq@hotmail.com', icon: 'mail' },
]

const iconMap = {
  qq: QqOutlined,
  wechat: WechatOutlined,
  phone: PhoneOutlined,
  mail: MailOutlined,
}

const handleCopy = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    message.success('联系方式已复制')
  } catch (error) {
    message.error('复制失败，请手动复制')
  }
}
</script>

<template>
  <section class="page-card support-page">
    <h2>技术支持</h2>
    <p class="muted">提供 7x24 小时支持，点击即可复制联系方式</p>

    <div class="support-grid">
      <a-card
        v-for="contact in contacts"
        :key="contact.label"
        hoverable
        class="support-card"
        @click="handleCopy(contact.value)"
      >
        <div class="card-header">
          <component :is="iconMap[contact.icon]" class="contact-icon" />
          <p class="label">{{ contact.label }}</p>
        </div>
        <p class="value">{{ contact.value }}</p>
        <small>点击复制</small>
      </a-card>
    </div>
  </section>
</template>

<style scoped>
.muted {
  color: #6b7280;
}

.support-grid {
  margin-top: 24px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.support-card {
  cursor: pointer;
}

.support-card .label {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.support-card .value {
  margin: 8px 0 4px;
  font-size: 20px;
  font-weight: 600;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-icon {
  font-size: 20px;
  color: #1677ff;
}
</style>

