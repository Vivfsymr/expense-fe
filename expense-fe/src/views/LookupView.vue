<template>
  <div class="lookup-page">
    <div class="lookup-card">
      <h2 class="section-title">Tra nghĩa</h2>
      <p class="section-desc">Tra từ bằng AI — chỉ xem, không lưu vào DB.</p>

      <form class="lookup-form" @submit.prevent="onLookup">
        <input
          v-model="word"
          class="lookup-input"
          type="text"
          placeholder="VD: attract"
          autocomplete="off"
          :disabled="loading"
        />
        <button class="lookup-btn" type="submit" :disabled="loading || !word.trim()">
          {{ loading ? 'Đang tra...' : 'Tra nghĩa' }}
        </button>
      </form>

      <div v-if="error" class="error-msg">{{ error }}</div>
      <div v-if="saveSuccess" class="success-msg">{{ saveSuccess }}</div>
      <div v-if="saveError" class="error-msg">{{ saveError }}</div>

      <div v-if="result" class="result-box">
        <div class="result-header">
          <div class="result-title">
            <span class="result-word">{{ result.word }}</span>
            <button
              class="speak-btn"
              type="button"
              title="Đọc từ vựng"
              :disabled="!result.body"
              @click="speakResult"
            >
              🔊
            </button>
          </div>
          <div class="result-actions">
            <span class="result-badge">{{ saved ? 'Đã lưu' : 'Chưa lưu' }}</span>
            <button
              class="save-btn"
              type="button"
              :disabled="saving || saved || !result.body"
              @click="onSave"
            >
              {{ saving ? 'Đang lưu...' : saved ? 'Đã lưu' : 'Lưu từ này' }}
            </button>
          </div>
        </div>
        <div class="result-body" v-html="formatWordContent(result.body)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { lookupWord, createFromForm } from '../api/words'
import { formatWordContent, escapeString } from '../utils/formatWord'
import { useSpeech } from '../composables/useSpeech'
import type { WordLookupResult } from '../types'

const { speakText } = useSpeech()

const word = ref('')
const loading = ref(false)
const error = ref('')
const result = ref<WordLookupResult | null>(null)

const saving = ref(false)
const saved = ref(false)
const saveSuccess = ref('')
const saveError = ref('')

function speakResult() {
  if (!result.value?.body) return
  speakText(result.value.body)
}

async function onLookup() {
  const value = word.value.trim()
  if (!value) return

  loading.value = true
  error.value = ''
  saveSuccess.value = ''
  saveError.value = ''
  saved.value = false
  result.value = null
  try {
    result.value = await lookupWord(value)
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    error.value = err?.response?.data?.message || err?.message || 'Tra nghĩa thất bại!'
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (!result.value?.body || saved.value) return

  saving.value = true
  saveSuccess.value = ''
  saveError.value = ''
  try {
    // Match /words/form format: newlines escaped as \n
    await createFromForm(escapeString(result.value.body))
    saved.value = true
    saveSuccess.value = `Đã lưu từ "${result.value.word}" thành công!`
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    saveError.value = err?.response?.data?.message || err?.message || 'Lưu từ thất bại!'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.lookup-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding: calc(var(--app-header-height, 50px) + 16px) 16px 24px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.lookup-card {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px;
  border-radius: 16px;
  background: #1a1a1a;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

.section-title {
  margin: 0 0 8px;
  font-size: 1.35rem;
  font-weight: 700;
}

.section-desc {
  margin: 0 0 18px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.lookup-form {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.lookup-input {
  flex: 1;
  min-width: 180px;
  background: #2a2a2a;
  color: #fff;
  border: 1px solid #444;
  border-radius: 8px;
  font-size: 1rem;
  padding: 12px 14px;
  box-sizing: border-box;
}

.lookup-input:focus {
  outline: none;
  border-color: #69b1ff;
}

.lookup-btn {
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-width: 120px;
}

.lookup-btn:disabled {
  background: #555;
  color: #aaa;
  cursor: not-allowed;
}

.error-msg {
  color: #ff6b6b;
  margin-top: 12px;
  font-weight: 600;
}

.result-box {
  margin-top: 20px;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
  background: #111;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  background: #2a2a2a;
  border-bottom: 1px solid #333;
  flex-wrap: wrap;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.result-word {
  font-size: 1.1rem;
  font-weight: 700;
}

.speak-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.speak-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.speak-btn:not(:disabled):active {
  transform: scale(0.96);
}

.result-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(102, 126, 234, 0.25);
  color: #c3c9ff;
  white-space: nowrap;
}

.save-btn {
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.save-btn:disabled {
  background: #555;
  color: #aaa;
  cursor: not-allowed;
}

.success-msg {
  color: #52c41a;
  margin-top: 12px;
  font-weight: 600;
}

.result-body {
  padding: 16px 18px 20px;
  font-size: 14px;
  line-height: 1.65;
  color: #fff;
  word-break: break-word;
  max-height: min(60vh, 60dvh);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.result-body :deep(.check-mark) {
  color: #52c41a;
  font-weight: bold;
}

.result-body :deep(.arrow) {
  color: #40a9ff;
  font-weight: bold;
  margin: 0 5px;
}

.result-body :deep(.pronunciation) {
  color: #b37feb;
  font-weight: bold;
}

.result-body :deep(.word-type) {
  background: #2a2a2a;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  color: #d9d9d9;
  border: 1px solid #404040;
}

@media (max-width: 768px) {
  .lookup-page {
    padding: calc(var(--app-header-height, 48px) + 12px) 10px 20px;
  }

  .lookup-card {
    padding: 18px 14px;
    border-radius: 12px;
  }

  .lookup-form {
    flex-direction: column;
    align-items: stretch;
  }

  .lookup-input,
  .lookup-btn,
  .save-btn {
    width: 100%;
  }

  .result-actions {
    width: 100%;
  }
}
</style>
