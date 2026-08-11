<template>
  <Teleport to="body">
    <div
      v-if="wordId"
      class="vocab-detail-modal-overlay"
      @click="emit('close')"
    >
      <div class="vocab-detail-modal" @click.stop>
        <div class="vocab-detail-modal__header">
          <h2>Chi tiết từ vựng</h2>
          <div class="vocab-detail-modal__actions">
            <a-button
              type="primary"
              shape="circle"
              class="speak-button"
              :disabled="!word"
              title="Đọc từ vựng"
              @click="speakWord"
            >
              🔊
            </a-button>
            <a-button
              :type="word?.bookMark ? 'primary' : 'default'"
              shape="circle"
              class="bookmark-button"
              :disabled="!word"
              :title="word?.bookMark ? 'Bỏ bookmark' : 'Bookmark từ này'"
              @click="toggleBookmark"
            >
              <span v-if="word?.bookMark">★</span>
              <span v-else>☆</span>
            </a-button>
            <a-button
              danger
              shape="circle"
              class="delete-btn"
              :disabled="!word"
              title="Xoá từ này"
              @click="handleDelete"
            >
              🗑️
            </a-button>
            <button
              class="vocab-detail-modal__close"
              aria-label="Đóng"
              @click="emit('close')"
            >
              &times;
            </button>
          </div>
        </div>
        <div class="vocab-detail-modal__body">
          <div v-if="loading" class="vocab-detail-modal__loading">
            <a-spin size="large" />
            <p>Đang tải chi tiết...</p>
          </div>
          <div v-else-if="word" class="word-detail">
            <div class="detail-content" v-html="formatWordContent(word.body)"></div>
          </div>
          <div v-else class="vocab-detail-modal__error">Không thể tải chi tiết từ vựng</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { bookmarkWord, deleteWord, getWordDetail } from '../api/words'
import { useSpeech } from '../composables/useSpeech'
import { formatWordContent } from '../utils/formatWord'
import type { Word } from '../types'

const props = defineProps<{
  wordId: string | null
}>()

const emit = defineEmits<{
  close: []
  deleted: [id: string]
}>()

const { speakText } = useSpeech()
const loading = ref(false)
const word = ref<Word | null>(null)

async function loadDetail(id: string) {
  loading.value = true
  word.value = null
  try {
    word.value = await getWordDetail(id)
  } catch (e) {
    console.error('Error loading word detail:', e)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.wordId,
  (id) => {
    if (id) loadDetail(id)
    else word.value = null
  },
  { immediate: true },
)

function speakWord() {
  if (!word.value?.body) return
  speakText(word.value.body)
}

async function toggleBookmark() {
  if (!word.value?._id) return
  const next = !word.value.bookMark
  try {
    await bookmarkWord(word.value._id, next)
    word.value.bookMark = next
  } catch {
    alert('Thao tác bookmark thất bại!')
  }
}

async function handleDelete() {
  const id = word.value?._id
  if (!id) return
  if (!confirm('Bạn có chắc muốn xoá từ này?')) return
  try {
    await deleteWord(id)
    emit('deleted', id)
    emit('close')
  } catch {
    alert('Xoá thất bại!')
  }
}
</script>
