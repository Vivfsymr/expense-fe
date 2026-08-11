import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as wordsApi from '../api/words'
import type { WordSummary } from '../types'

export function useVocabulary() {
  const words = ref<WordSummary[]>([])
  const loading = ref(false)
  const searchKeyword = ref('')
  const orderBy = ref('')
  const currentPage = ref(1)
  const limit = ref(50)
  const hasMore = ref(true)
  const total = ref(0)
  const showBackToTop = ref(false)
  const detailId = ref<string | null>(null)

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

  const handleSearch = () => {
    currentPage.value = 1
    hasMore.value = true
    loadWords(1)
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

  const showWordDetail = (wordId: string) => {
    detailId.value = wordId
  }

  const closeDetail = () => {
    detailId.value = null
  }

  const onWordDeleted = async () => {
    await loadWords(currentPage.value)
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
    searchKeyword,
    orderBy,
    currentPage,
    limit,
    total,
    showBackToTop,
    detailId,
    handleSearch,
    handleSortChange,
    onPageChange,
    showWordDetail,
    closeDetail,
    onWordDeleted,
    scrollToTop,
  }
}
