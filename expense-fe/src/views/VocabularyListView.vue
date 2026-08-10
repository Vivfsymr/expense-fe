<template>
  <div class="vocabulary-list">
    <div class="header">
      <div class="controls">
        <div class="search-filter">
          <a-input-search
            v-model:value="searchKeyword"
            class="search-input"
            placeholder="Tìm kiếm từ vựng..."
            @search="handleSearch"
            @pressEnter="handleSearch"
            size="small"
          />
          <a-select
            v-model:value="orderBy"
            class="sort-select"
            @change="handleSortChange"
            placeholder="Sắp xếp"
            size="small"
          >
            <a-select-option value="">Mặc định</a-select-option>
            <a-select-option value="newest">Mới nhất</a-select-option>
            <a-select-option value="oldest">Cũ nhất</a-select-option>
            <a-select-option value="alpha">A-Z</a-select-option>
            <a-select-option value="beta">Z-A</a-select-option>
            <a-select-option value="random">Ngẫu nhiên</a-select-option>
            <a-select-option value="bookmark">Bookmark</a-select-option>
          </a-select>
        </div>
        <div class="word-counter" v-if="words.length > 0 || total > 0">
          {{ words.length }} từ · Trang {{ currentPage }} · Tổng {{ total }}
        </div>
      </div>
    </div>

    <div class="content">
      <div class="loading" v-if="loading">
        <a-spin size="large" />
        <p>Đang tải từ vựng...</p>
      </div>

      <div class="vocabulary-scroll-container" v-else>
        <div class="vocabulary-list-container">
          <div
            v-for="word in words"
            :key="word._id"
            class="vocabulary-item"
          >
            <div class="word-body" @click="showWordDetail(word._id)">{{ toListPreview(word.body) }}</div>
          </div>
        </div>

        <div class="pagination" v-if="words.length > 0">
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
          <span class="page-info" v-if="!isMobile">
            Trang {{ currentPage }} / {{ Math.ceil(total / limit) || 1 }}
          </span>
        </div>
      </div>
    </div>

    <div class="back-to-top" v-if="showBackToTop" @click="scrollToTop">
      <a-button type="primary" shape="circle" size="large">↑</a-button>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Chi tiết từ vựng</h2>
          <div class="header-actions">
            <a-button
              type="primary"
              shape="circle"
              class="speak-button"
              @click="speakWord"
              :disabled="!wordDetail"
              title="Đọc từ vựng"
            >
              🔊
            </a-button>
            <a-button
              :type="wordDetail && wordDetail.bookMark ? 'primary' : 'default'"
              shape="circle"
              class="bookmark-button"
              @click="toggleBookmark"
              :disabled="!wordDetail"
              :title="wordDetail && wordDetail.bookMark ? 'Bỏ bookmark' : 'Bookmark từ này'"
            >
              <span v-if="wordDetail && wordDetail.bookMark">★</span>
              <span v-else>☆</span>
            </a-button>
            <a-button
              danger
              shape="circle"
              class="delete-btn"
              @click="handleDeleteWord(wordDetail?._id)"
              :disabled="!wordDetail"
              title="Xoá từ này"
            >🗑️</a-button>
            <button @click="closeModal" class="close-btn" aria-label="Đóng">&times;</button>
          </div>
        </div>
        <div class="modal-body">
          <div v-if="loadingDetail" class="loading">
            <a-spin size="large" />
            <p>Đang tải chi tiết...</p>
          </div>
          <div v-else-if="wordDetail" class="word-detail">
            <div class="detail-content" v-html="formatWordContent(wordDetail.body)"></div>
          </div>
          <div v-else class="error">Không thể tải chi tiết từ vựng</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
<<<<<<< HEAD
import { useVocabulary } from '../composables/useVocabulary'
import { formatWordContent, toListPreview } from '../utils/formatWord'
=======
import { wordService } from '../services/wordService'
import { useRoute, useRouter } from 'vue-router'
>>>>>>> d067f5e0f6217550fce796e626708636e77ab4c2

const {
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
} = useVocabulary()

<<<<<<< HEAD
const isMobile = ref(false)

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
=======
const route = useRoute()
const router = useRouter()

// Back to top
const showBackToTop = ref(false)

// Modal
const showModal = ref(false)
const wordDetail = ref(null)

// Methods
const loadWords = async (page = 1) => {
  loading.value = true
  try {
    // Cập nhật query param page trên URL, giữ lại filter hiện tại
    const newQuery = {
      ...route.query,
      page: page,
    };
    if (searchKeyword.value) newQuery.keyword = searchKeyword.value;
    else delete newQuery.keyword;
    if (orderBy.value) newQuery.orderBy = orderBy.value;
    else delete newQuery.orderBy;
    router.replace({ query: newQuery });

    const offset = (page - 1) * limit.value
    const params = {
      keyword: searchKeyword.value || undefined,
      orderBy: orderBy.value || undefined,
      offset: offset,
      limit: limit.value
    }
    const response = await wordService.getWordSummary(params)
    words.value = response.items || []
    total.value = typeof response.total === 'number' ? response.total : words.value.length
    currentPage.value = page
    hasMore.value = words.value.length === limit.value
  } catch (error) {
    console.error('Error loading words:', error)
    words.value = []
  } finally {
    loading.value = false
  }
>>>>>>> d067f5e0f6217550fce796e626708636e77ab4c2
}

onMounted(() => {
<<<<<<< HEAD
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
=======
  // Lấy filter và page từ URL nếu có
  let pageFromUrl = 1
  if (route.query.page) {
    const parsed = parseInt(route.query.page)
    if (!isNaN(parsed) && parsed > 0) {
      pageFromUrl = parsed
    }
  }
  // Ưu tiên lấy filter từ URL query param nếu có
  if (typeof route.query.keyword === 'string') {
    searchKeyword.value = route.query.keyword
  }
  if (typeof route.query.orderBy === 'string') {
    orderBy.value = route.query.orderBy
  }
  currentPage.value = pageFromUrl
  loadWords(pageFromUrl)
  // Add scroll listener to the scroll container
  const scrollContainer = document.querySelector('.vocabulary-scroll-container')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll)
  }
>>>>>>> d067f5e0f6217550fce796e626708636e77ab4c2
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})
</script>

<style scoped>
:deep(.ant-pagination-options) {
  display: none !important;
}

.vocabulary-list {
  height: calc(100vh - var(--app-header-height, 50px));
  height: calc(100dvh - var(--app-header-height, 50px));
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  position: fixed;
  top: var(--app-header-height, 50px);
  left: 0;
  z-index: 10;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
}

.header {
  flex-shrink: 0;
  background: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(10px);
  z-index: 20;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-height: 0;
}

.vocabulary-scroll-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 16px 80px;
  min-height: 0;
}

.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.search-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.search-input {
  width: 250px;
  max-width: 100%;
}

.sort-select {
  width: 150px;
}

.word-counter {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.8);
}

.vocabulary-list-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.vocabulary-item {
  background: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  width: 100%;
  box-sizing: border-box;
}

.vocabulary-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  border: 1px solid #667eea;
  background: #2a2a2a;
}

.word-body {
  font-size: 15px;
  line-height: 1.5;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  padding: 12px 0 24px;
  gap: 10px;
  flex-wrap: wrap;
}

.page-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 12px;
  box-sizing: border-box;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: min(85vh, 85dvh);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: #2a2a2a;
  gap: 8px;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 15px;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.speak-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-body {
  padding: 14px 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #1a1a1a;
  min-height: 0;
}

.detail-content {
  font-size: 14px;
  line-height: 1.6;
  color: #ffffff;
  word-wrap: break-word;
}

.error {
  text-align: center;
  color: #ff6b6b;
  padding: 20px;
}

.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 16px;
  z-index: 1000;
}

.delete-btn {
  background: #fff !important;
  color: #c00 !important;
  border: 1px solid #c00 !important;
}

@media (max-width: 768px) {
  .header {
    padding: 10px 12px;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .search-filter {
    display: grid;
    grid-template-columns: 1fr 110px;
    gap: 8px;
  }

  .search-input,
  .sort-select {
    width: 100% !important;
  }

  .word-counter {
    text-align: right;
    font-size: 12px;
  }

  .vocabulary-scroll-container {
    padding: 10px 10px 72px;
  }

  .vocabulary-item {
    padding: 12px;
  }

  .vocabulary-item:hover {
    transform: none;
  }

  .word-body {
    font-size: 14px;
  }

  .modal-content {
    max-height: min(92vh, 92dvh);
  }

  .modal-header h2 {
    font-size: 14px;
  }

  .pagination {
    padding-bottom: 16px;
  }

  :deep(.ant-pagination) {
    color: #fff;
  }
}

@media (max-width: 480px) {
  .search-filter {
    grid-template-columns: 1fr;
  }

  .word-body {
    font-size: 13px;
    line-height: 1.35;
  }

  .header-actions :deep(.ant-btn) {
    width: 34px;
    height: 34px;
    min-width: 34px;
  }
}
</style>
