<template>
  <div class="quiz-page">
    <div class="quiz-card">
      <div class="quiz-toolbar">
        <div>
          <h2 class="section-title">Luyện từ</h2>
          <p class="section-desc">Xem nghĩa tiếng Việt, nhập từ tiếng Anh tương ứng.</p>
        </div>
      </div>

      <div class="filters">
        <a-input-search
          v-model:value="searchKeyword"
          class="search-input"
          placeholder="Tìm kiếm từ vựng..."
          @search="handleSearch"
          @pressEnter="handleSearch"
          size="middle"
        />
        <a-select
          v-model:value="orderBy"
          class="sort-select"
          placeholder="Sắp xếp"
          @change="handleSortChange"
        >
          <a-select-option value="">Mặc định</a-select-option>
          <a-select-option value="newest">Mới nhất</a-select-option>
          <a-select-option value="oldest">Cũ nhất</a-select-option>
          <a-select-option value="alpha">A-Z</a-select-option>
          <a-select-option value="beta">Z-A</a-select-option>
          <a-select-option value="random">Ngẫu nhiên</a-select-option>
          <a-select-option value="bookmark">Bookmark</a-select-option>
        </a-select>
        <div class="word-counter" v-if="total > 0">
          Trang {{ currentPage }} · Tổng {{ total }}
        </div>
      </div>

      <div v-if="error" class="error-msg">{{ error }}</div>

      <div v-if="loading" class="loading-box">
        <a-spin size="large" />
        <p>Đang tải câu hỏi...</p>
      </div>

      <div v-else-if="rows.length === 0" class="empty-box">
        Không có dữ liệu luyện từ.
      </div>

      <div v-else class="quiz-list">
        <div class="quiz-score">
          Đúng {{ correctCount }}/{{ rows.length }}
        </div>

        <div v-for="(row, index) in rows" :key="row.id" class="quiz-row">
          <div class="hint-col" role="button" tabindex="0" @click="showDetail(row.id)" @keydown.enter.prevent="showDetail(row.id)">
            <span class="row-index">{{ (currentPage - 1) * limit + index + 1 }}.</span>
            <div class="hint-text">
              {{ row.vietnameseHint }}
            </div>
          </div>

          <div class="answer-col">
            <input
              v-model="row.answer"
              class="answer-input"
              :class="statusClass(row)"
              type="text"
              placeholder="Nhập từ tiếng Anh..."
              autocomplete="off"
              @input="onAnswerInput(row)"
            />
            <span class="status-icon" :class="statusClass(row)">
              <template v-if="row.status === 'correct'">✓</template>
              <template v-else-if="row.status === 'wrong'">✗</template>
              <template v-else>—</template>
            </span>
            <button
              class="reveal-btn"
              type="button"
              @click="revealWord(row)"
              :title="row.revealed ? 'Ẩn từ' : 'Hiện từ tiếng Anh'"
            >
              {{ row.revealed ? row.english : 'Hiện từ' }}
            </button>
            <button
              class="hint-action-btn"
              type="button"
              @click="showHint(row)"
              title="Gợi ý thêm chữ cái"
            >
              {{ hintLabel(row) }}
            </button>
          </div>
        </div>

        <div class="pagination" v-if="total > 0">
          <a-pagination
            :current="currentPage"
            :page-size="limit"
            :total="total"
            @change="onPageChange"
            :show-size-changer="false"
            :show-less-items="true"
            :simple="isMobile"
            size="small"
          />
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showModal"
        class="vocab-detail-modal-overlay"
        @click="closeDetail"
      >
        <div class="vocab-detail-modal" @click.stop>
          <div class="vocab-detail-modal__header">
            <h2>Chi tiết từ vựng</h2>
            <div class="vocab-detail-modal__actions">
              <a-button
                type="primary"
                shape="circle"
                class="speak-button"
                @click="speakDetail"
                :disabled="!wordDetail"
                title="Đọc từ vựng"
              >
                🔊
              </a-button>
              <button @click="closeDetail" class="vocab-detail-modal__close" aria-label="Đóng">&times;</button>
            </div>
          </div>
          <div class="vocab-detail-modal__body">
            <div v-if="loadingDetail" class="vocab-detail-modal__loading">
              <a-spin size="large" />
              <p>Đang tải chi tiết...</p>
            </div>
            <div v-else-if="wordDetail" class="word-detail">
              <div class="detail-content" v-html="formatWordContent(wordDetail.body)"></div>
            </div>
            <div v-else class="vocab-detail-modal__error">Không thể tải chi tiết từ vựng</div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { getQuiz, getWordDetail } from '../api/words'
import { formatWordContent } from '../utils/formatWord'
import { useSpeech } from '../composables/useSpeech'
import type { Word, WordQuizItem } from '../types'

type AnswerStatus = 'idle' | 'correct' | 'wrong'

interface QuizRow extends WordQuizItem {
  answer: string
  status: AnswerStatus
  revealed: boolean
  hintLevel: number
}

const { speakText } = useSpeech()

const loading = ref(false)
const error = ref('')
const searchKeyword = ref('')
const orderBy = ref('newest')
const currentPage = ref(1)
const limit = ref(50)
const total = ref(0)
const rows = reactive<QuizRow[]>([])
const isMobile = ref(false)

const showModal = ref(false)
const loadingDetail = ref(false)
const wordDetail = ref<Word | null>(null)

const correctCount = computed(() => rows.filter((r) => r.status === 'correct').length)

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase()
}

function isCorrect(row: QuizRow) {
  const answer = normalizeAnswer(row.answer)
  if (!answer) return false
  const accepted = (row.acceptedAnswers?.length ? row.acceptedAnswers : [row.english])
    .map((a) => normalizeAnswer(a))
  return accepted.includes(answer)
}

function onAnswerInput(row: QuizRow) {
  if (!row.answer.trim()) {
    row.status = 'idle'
    return
  }
  row.status = isCorrect(row) ? 'correct' : 'wrong'
}

function revealWord(row: QuizRow) {
  row.revealed = !row.revealed
}

function hintLabel(row: QuizRow) {
  if (row.hintLevel <= 0) return 'Hint'
  const word = row.english || ''
  const shown = Math.min(row.hintLevel, word.length)
  return word.slice(0, shown) + '_'.repeat(Math.max(0, word.length - shown))
}

function showHint(row: QuizRow) {
  const max = row.english?.length || 0
  if (row.hintLevel < max) {
    row.hintLevel += 1
  }
}

function statusClass(row: QuizRow) {
  return row.status
}

async function showDetail(id: string) {
  showModal.value = true
  loadingDetail.value = true
  wordDetail.value = null
  try {
    wordDetail.value = await getWordDetail(id)
  } catch (e) {
    console.error('Error loading word detail:', e)
  } finally {
    loadingDetail.value = false
  }
}

function closeDetail() {
  showModal.value = false
  wordDetail.value = null
}

function speakDetail() {
  if (!wordDetail.value?.body) return
  speakText(wordDetail.value.body)
}

function handleSearch() {
  currentPage.value = 1
  loadQuiz()
}

function handleSortChange() {
  currentPage.value = 1
  loadQuiz()
}

function onPageChange(page: number) {
  currentPage.value = page
  loadQuiz()
}

async function loadQuiz() {
  loading.value = true
  error.value = ''
  rows.splice(0, rows.length)
  try {
    const offset = (currentPage.value - 1) * limit.value
    const data = await getQuiz({
      keyword: searchKeyword.value.trim() || undefined,
      orderBy: orderBy.value || undefined,
      offset,
      limit: limit.value,
    })
    total.value = data.total || 0
    for (const item of data.items || []) {
      rows.push({
        ...item,
        answer: '',
        status: 'idle',
        revealed: false,
        hintLevel: 0,
      })
    }
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } | string }; message?: string }
    const msg = err?.response?.data
    error.value =
      (typeof msg === 'string' ? msg : msg?.message) ||
      err?.message ||
      'Không tải được bộ câu hỏi!'
  } finally {
    loading.value = false
  }
}

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
  loadQuiz()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})
</script>

<style scoped>
.quiz-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding: calc(var(--app-header-height, 50px) + 16px) 16px 24px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.quiz-card {
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  border-radius: 16px;
  background: #1a1a1a;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  border: 1px solid #333;
}

.quiz-toolbar {
  margin-bottom: 14px;
}

.section-title {
  margin: 0 0 6px;
  font-size: 1.35rem;
  font-weight: 700;
}

.section-desc {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.filters {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.search-input {
  width: 250px;
  max-width: 100%;
}

.sort-select {
  width: 150px;
}

.word-counter {
  margin-left: auto;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
}

.error-msg {
  color: #ff6b6b;
  margin-bottom: 12px;
  font-weight: 600;
}

.loading-box,
.empty-box {
  text-align: center;
  padding: 40px 16px;
  color: rgba(255, 255, 255, 0.75);
}

.quiz-score {
  margin-bottom: 12px;
  font-weight: 600;
  color: #69b1ff;
}

.quiz-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quiz-row {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  background: #222;
  border: 1px solid #333;
}

.hint-col {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  min-width: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(105, 177, 255, 0.25);
  touch-action: manipulation;
}

.hint-col:active .hint-text {
  color: #69b1ff;
}

.row-index {
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
  font-weight: 600;
}

.hint-text {
  line-height: 1.45;
  word-break: break-word;
  flex: 1;
  min-width: 0;
  text-align: left;
}

.hint-text:hover {
  color: #69b1ff;
}

.answer-col {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.answer-input {
  flex: 1;
  min-width: 0;
  background: #2a2a2a;
  color: #fff;
  border: 1px solid #555;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 1rem;
}

.answer-input:focus {
  outline: none;
  border-color: #69b1ff;
}

.answer-input.correct {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.12);
}

.answer-input.wrong {
  border-color: #ff4d4f;
  background: rgba(255, 77, 79, 0.12);
}

.status-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  background: #333;
  color: #888;
}

.status-icon.correct {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-icon.wrong {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.reveal-btn,
.hint-action-btn {
  flex-shrink: 0;
  border: 1px solid #555;
  background: #2a2a2a;
  color: #fff;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.85rem;
  min-width: 72px;
}

.reveal-btn:hover,
.hint-action-btn:hover {
  border-color: #69b1ff;
  color: #69b1ff;
}

.hint-action-btn {
  border-color: #faad14;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0.5px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 16px 0 4px;
}

@media (max-width: 768px) {
  .quiz-page {
    padding: calc(var(--app-header-height, 48px) + 12px) 10px 20px;
  }

  .quiz-card {
    padding: 16px 12px;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .sort-select {
    width: 100% !important;
  }

  .word-counter {
    margin-left: 0;
    text-align: right;
  }

  .quiz-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .answer-col {
    flex-wrap: wrap;
  }

  .answer-input {
    width: 100%;
    flex: 1 1 100%;
  }

  .reveal-btn,
  .hint-action-btn {
    flex: 1;
  }
}
</style>
