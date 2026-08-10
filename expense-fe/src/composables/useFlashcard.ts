import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as wordsApi from '../api/words'
import { useSpeech } from './useSpeech'
import type { Word, WordQueryParams } from '../types'

type SortOrder = 'alpha' | 'beta' | 'newest' | 'oldest' | 'random'

export function useFlashcard() {
  const { speakText } = useSpeech()

  const words = ref<Word[]>([])
  const currentIndex = ref(0)
  const loading = ref(true)
  const searchKeyword = ref('')
  const sortOrder = ref<SortOrder>('newest')
  const currentPage = ref(1)
  const limit = ref(50)
  const total = ref(0)
  const hasMore = ref(true)
  const cardFrontRef = ref<HTMLDivElement | null>(null)

  const touchStartX = ref(0)
  const touchEndX = ref(0)
  const touchStartY = ref(0)
  const touchEndY = ref(0)

  const currentWord = computed(() => words.value[currentIndex.value])

  const speakWord = () => {
    if (!currentWord.value?.body) return
    speakText(currentWord.value.body)
  }

  const scrollToTop = () => {
    if (cardFrontRef.value?.scrollTo) {
      cardFrontRef.value.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (cardFrontRef.value) {
      cardFrontRef.value.scrollTop = 0
    }
  }

  const loadWords = async (page = 1) => {
    try {
      loading.value = true
      const offset = (page - 1) * limit.value
      const params: WordQueryParams = {
        orderBy: sortOrder.value,
        offset,
        limit: limit.value,
      }
      if (searchKeyword.value.trim()) {
        params.keyword = searchKeyword.value.trim()
      }

      const pageData = await wordsApi.getWordsPage(params)
      words.value = pageData.items as Word[]
      total.value = pageData.total
      currentPage.value = page
      currentIndex.value = 0
      hasMore.value = offset + pageData.items.length < pageData.total
    } catch (error) {
      console.error('Error loading words:', error)
    } finally {
      loading.value = false
    }
  }

  const goToNextPage = async () => {
    if (!hasMore.value) return
    await loadWords(currentPage.value + 1)
    scrollToTop()
  }

  const goToPreviousPage = async () => {
    if (currentPage.value === 1) return
    await loadWords(currentPage.value - 1)
    scrollToTop()
  }

  const searchWords = async () => {
    currentPage.value = 1
    await loadWords(1)
  }

  const handleSortChange = async () => {
    currentPage.value = 1
    await loadWords(1)
  }

  const nextCard = () => {
    if (currentIndex.value < words.value.length - 1) {
      currentIndex.value++
      setTimeout(scrollToTop, 50)
    }
  }

  const previousCard = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      setTimeout(scrollToTop, 50)
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
  }

  const handleTouchMove = (_e: TouchEvent) => {
    // allow vertical scroll
  }

  const handleSwipe = () => {
    const swipeThreshold = 50
    const swipeDistanceX = touchStartX.value - touchEndX.value
    const swipeDistanceY = Math.abs(touchStartY.value - touchEndY.value)

    if (Math.abs(swipeDistanceX) > swipeThreshold && Math.abs(swipeDistanceX) > swipeDistanceY) {
      if (swipeDistanceX > 0) nextCard()
      else previousCard()
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX.value = e.changedTouches[0].clientX
    touchEndY.value = e.changedTouches[0].clientY
    handleSwipe()
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'j' || e.key === 'J') previousCard()
    else if (e.key === 'l' || e.key === 'L') nextCard()
  }

  onMounted(() => {
    loadWords(1)
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    words,
    currentIndex,
    loading,
    searchKeyword,
    sortOrder,
    currentPage,
    total,
    hasMore,
    cardFrontRef,
    currentWord,
    speakWord,
    goToNextPage,
    goToPreviousPage,
    searchWords,
    handleSortChange,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
