<template>
  <div class="add-word-page">
    <div class="add-word-dark ai-card">
      <h2 class="section-title">Lưu 1 từ (AI)</h2>
      <p class="section-desc">Nhập một từ tiếng Anh, hệ thống sẽ tạo nội dung và lưu vào DB.</p>
      <form class="ai-form" @submit.prevent="submitAi">
        <input
          v-model="aiWord"
          class="ai-input"
          type="text"
          placeholder="VD: attract"
          autocomplete="off"
          :disabled="aiLoading"
        />
        <button class="dark-btn" type="submit" :disabled="aiLoading || !aiWord.trim()">
          {{ aiLoading ? 'Đang lưu...' : 'Lưu từ' }}
        </button>
      </form>
      <div v-if="aiSuccess" class="success-msg">{{ aiSuccess }}</div>
      <div v-if="aiError" class="error-msg">{{ aiError }}</div>
    </div>

    <div class="add-word-dark">
      <h2 class="section-title">Paste nội dung thủ công</h2>
      <label for="input"><b>Paste nội dung cần escape:</b></label>
      <textarea
        id="input"
        v-model="input"
        :rows="textareaRows"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { createFromForm, createFromAi } from '../api/words'
import { escapeString } from '../utils/formatWord'

const input = ref('')
const escaped = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')
const isMobile = ref(false)

const aiWord = ref('')
const aiLoading = ref(false)
const aiSuccess = ref('')
const aiError = ref('')

const textareaRows = computed(() => (isMobile.value ? 12 : 20))

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

function escapeAndCopy() {
  escaped.value = escapeString(input.value)
  if (escaped.value) {
    navigator.clipboard.writeText(escaped.value)
  }
}

watch(input, escapeAndCopy)

async function submitAi() {
  const word = aiWord.value.trim()
  if (!word) return

  aiLoading.value = true
  aiSuccess.value = ''
  aiError.value = ''
  try {
    await createFromAi(word)
    aiSuccess.value = `Đã lưu từ "${word}" thành công!`
    aiWord.value = ''
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    aiError.value = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!'
  } finally {
    aiLoading.value = false
  }
}

async function submit() {
  loading.value = true
  success.value = false
  error.value = ''
  try {
    await createFromForm(escaped.value)
    success.value = true
    input.value = ''
    escaped.value = ''
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err?.response?.data?.message || 'Có lỗi xảy ra!'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})
</script>

<style scoped>
.add-word-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding: calc(var(--app-header-height, 50px) + 16px) 16px 24px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.add-word-dark {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px;
  border-radius: 16px;
  background: #1a1a1a;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  border: 1px solid #333;
}

.ai-card {
  border-color: #404040;
}

.section-title {
  margin: 0 0 8px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.section-desc {
  margin: 0 0 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.ai-form {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.ai-input {
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

.ai-input:focus {
  outline: none;
  border-color: #69b1ff;
  background: #222;
}

.ai-input::placeholder {
  color: #888;
}

label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.05rem;
  margin-bottom: 8px;
  display: block;
}

.dark-textarea {
  width: 100%;
  background: #2a2a2a;
  color: #fff;
  border: 1px solid #444;
  border-radius: 8px;
  font-size: 1rem;
  padding: 12px;
  margin-bottom: 16px;
  resize: vertical;
  box-sizing: border-box;
  min-height: 180px;
}

.dark-textarea::placeholder {
  color: #888;
}

.dark-pre {
  background: #111;
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.95rem;
  margin-top: 8px;
  margin-bottom: 8px;
  word-break: break-word;
  white-space: pre-wrap;
  max-height: 240px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #333;
}

.dark-btn {
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  width: auto;
  min-width: 140px;
}

.ai-form .dark-btn {
  margin-top: 0;
}

.dark-btn:disabled {
  background: #555;
  color: #aaa;
  cursor: not-allowed;
}

.success-msg {
  color: #52c41a;
  margin-top: 12px;
  font-weight: bold;
}

.error-msg {
  color: #ff6b6b;
  margin-top: 12px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .add-word-page {
    padding: calc(var(--app-header-height, 48px) + 12px) 10px 20px;
  }

  .add-word-dark {
    padding: 18px 14px;
    border-radius: 12px;
  }

  .ai-form {
    flex-direction: column;
    align-items: stretch;
  }

  .ai-input,
  .dark-btn {
    width: 100%;
  }

  .dark-pre {
    font-size: 0.85rem;
    max-height: 180px;
  }
}
</style>
