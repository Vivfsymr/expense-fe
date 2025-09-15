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

.add-word-dark {
  max-width: 800px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 16px;
  background: #fff;
  color: #222;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
}

label {
  color: #222;
  font-size: 1.1rem;
  margin-bottom: 8px;
  display: block;
}
.dark-textarea {
  width: 100%;
  background: #f5f5f5;
  color: #222;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1.05rem;
  padding: 12px;
  margin-bottom: 16px;
  resize: vertical;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.dark-textarea::placeholder {
  color: #aaa;
}
.dark-pre {
  background: #222;
  color: #fff;
  padding: 14px;
  border-radius: 8px;
  font-size: 1.05rem;
  margin-top: 8px;
  margin-bottom: 8px;
  word-break: break-all;
}
.dark-btn {
  background: #222;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 32px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background 0.2s;
}
.dark-btn:disabled {
  background: #ccc;
  color: #888;
  cursor: not-allowed;
}
.success-msg {
  color: #1a8917;
  margin-top: 12px;
  font-weight: bold;
}
.error-msg {
  color: #c00;
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