
<template>
  <div style="max-width: 800px; margin: 40px auto;">
    <label for="input"><b>Paste nội dung cần escape:</b></label>
    <textarea
      id="input"
      v-model="input"
      rows="20"
      style="width: 100%; margin-bottom: 16px;"
      @input="escapeAndCopy"
      placeholder="Paste nội dung ở đây..."
    ></textarea>
    <div>
      <b>Đã tự động chuyển đổi và copy vào clipboard:</b>
      <pre style="background: #222; color: #fff; padding: 12px; border-radius: 6px;">{{ escaped }}</pre>
    </div>
    <button @click="submit" :disabled="loading || !escaped" style="margin-top: 16px;">Lưu xuống DB</button>
    <div v-if="success" style="color: green; margin-top: 10px;">Đã lưu thành công!</div>
    <div v-if="error" style="color: red; margin-top: 10px;">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const input = ref('')
const escaped = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

function escapeString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/"/g, '\\"')
}

function escapeAndCopy() {
  escaped.value = escapeString(input.value)
  if (escaped.value) {
    navigator.clipboard.writeText(escaped.value)
  }
}

watch(input, escapeAndCopy)

async function submit() {
  loading.value = true
  success.value = false
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('body', escaped.value)
    await axios.post('https://expense-be-dwhg.onrender.com/api/words/form', formData)
    success.value = true
    input.value = ''
    escaped.value = ''
  } catch (e) {
    error.value = e?.response?.data?.message || 'Có lỗi xảy ra!'
  } finally {
    loading.value = false
  }
}
</script>
