
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const input = ref('')
const escaped = ref('')

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
</script>
