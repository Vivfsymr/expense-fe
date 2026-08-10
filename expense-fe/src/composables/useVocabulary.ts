import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as wordsApi from '../api/words'
import { useSpeech } from './useSpeech'
import type { Word, WordSummary } from '../types'

export function useVocabulary() {
  const { speakText } = useSpeech()

  const words = ref<WordSummary[]>([])
  const loading = ref(false)
  const loadingDetail = ref(false)
  const searchKeyword = ref('')
  const orderBy = ref('')
  const currentPage = ref(1)
  const limit = ref(50)
  const hasMore = ref(true)
  const total = ref(0)
  const showBackToTop = ref(false)
  const showModal = ref(false)
  const wordDetail = ref<Word | null>(null)

  const loadWords = async (page = 1) => {
    loading.value = true
    try {
      const offset = (page - 1) * limit.value
      const response = await wordsApi.getWordSummary({
        keyword: searchKeyword.value || undefined,
        orderBy: orderBy.value || undefined,
        offset,
        limit: limit.value,
      })
      words.value = response.items
      total.value = response.total
      currentPage.value = page
      hasMore.value = words.value.length === limit.value
    } catch (error) {
      console.error('Error loading words:', error)
      words.value = []
    } finally {
      loading.value = false
    }
  }

  const handleDeleteWord = async (id?: string) => {
    if (!id) return
    if (!confirm('Bạn có chắc muốn xoá từ này?')) return
    try {
      loading.value = true
      await wordsApi.deleteWord(id)
      await loadWords(currentPage.value)
      closeModal()
    } catch {
      alert('Xoá thất bại!')
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    currentPage.value = 1
    hasMore.value = true
    loadWords(1)
  }

  const toggleBookmark = async () => {
    if (!wordDetail.value?._id) return
    const newValue = !wordDetail.value.bookMark
    try {
      await wordsApi.bookmarkWord(wordDetail.value._id, newValue)
      wordDetail.value.bookMark = newValue
      alert(newValue ? 'Đã bookmark!' : 'Đã bỏ bookmark!')
    } catch {
      alert('Thao tác bookmark thất bại!')
    }
  }

  const handleSortChange = () => {
    currentPage.value = 1
    hasMore.value = true
    loadWords(1)
  }

  const scrollToTop = () => {
    const scrollContainer = document.querySelector('.vocabulary-scroll-container')
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onPageChange = (page: number) => {
    loadWords(page)
    scrollToTop()
  }

  const showWordDetail = async (wordId: string) => {
    showModal.value = true
    loadingDetail.value = true
    wordDetail.value = null
    try {
      wordDetail.value = await wordsApi.getWordDetail(wordId)
    } catch (error) {
      console.error('Error loading word detail:', error)
    } finally {
      loadingDetail.value = false
    }
  }

  const closeModal = () => {
    showModal.value = false
    wordDetail.value = null
  }

  const speakWord = () => {
    if (!wordDetail.value?.body) return
    speakText(wordDetail.value.body)
  }

  const handleScroll = (event: Event) => {
    const scrollContainer = event.target as HTMLElement
    showBackToTop.value = scrollContainer.scrollTop > 500
  }

  let scrollContainer: Element | null = null

  onMounted(async () => {
    await loadWords(1)
    await nextTick()
    scrollContainer = document.querySelector('.vocabulary-scroll-container')
    scrollContainer?.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    scrollContainer?.removeEventListener('scroll', handleScroll)
  })

  return {
    words,
    loading,
    loadingDetail,
    searchKeyword,
    orderBy,
    currentPage,
    limit,
    total,
    showBackToTop,
    showModal,
    wordDetail,
    handleDeleteWord,
    handleSearch,
    toggleBookmark,
    handleSortChange,
    onPageChange,
    showWordDetail,
    closeModal,
    speakWord,
    scrollToTop,
  }
}
