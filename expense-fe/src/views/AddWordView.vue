<template>
  <div class="add-word-dark">
    <label for="input"><b>Paste nội dung cần escape:</b></label>
    <textarea
      id="input"
      v-model="input"
      rows="20"
      class="dark-textarea"
      @input="escapeAndCopy"
      placeholder="Paste nội dung ở đây..."
    ></textarea>
    <div>
      <b>Đã tự động chuyển đổi và copy vào clipboard:</b>
      <pre class="dark-pre">{{ escaped }}</pre>
    </div>
    <button class="dark-btn" @click="submit" :disabled="loading || !escaped">Lưu xuống DB</button>
    <div v-if="success" class="success-msg">Đã lưu thành công!</div>
    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<style scoped>

label {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 8px;
  display: block;
}
.dark-textarea {
  width: 100%;
  background: #18191a;
  color: #f3f3f3;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 1.05rem;
  padding: 12px;
  margin-bottom: 16px;
  resize: vertical;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.dark-textarea::placeholder {
  color: #888;
}
.dark-pre {
  background: #18191a;
  color: #00e676;
  padding: 14px;
  border-radius: 8px;
  font-size: 1.05rem;
  margin-top: 8px;
  margin-bottom: 8px;
  word-break: break-all;
}
.dark-btn {
  background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 32px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  transition: background 0.2s;
}
.dark-btn:disabled {
  background: #444;
  color: #aaa;
  cursor: not-allowed;
}
.success-msg {
  color: #00e676;
  margin-top: 12px;
  font-weight: bold;
}
.error-msg {
  color: #ff5252;
  margin-top: 12px;
  font-weight: bold;
}
</style>

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