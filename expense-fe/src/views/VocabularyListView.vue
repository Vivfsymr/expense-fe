<template>
  <div class="vocabulary-list">
    <div class="header">
      <div class="controls">
        <div class="search-filter">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="Tìm kiếm từ vựng..."
            @search="handleSearch"
            @pressEnter="handleSearch"
            style="width: 250px;"
            size="small"
          />
          <a-select
            v-model:value="orderBy"
            @change="handleSortChange"
            style="width: 150px;"
            placeholder="Sắp xếp"
            size="small"
          >
            <a-select-option value="">Mặc định</a-select-option>
            <a-select-option value="newest">Mới nhất</a-select-option>
            <a-select-option value="oldest">Cũ nhất</a-select-option>
            <a-select-option value="alpha">A-Z</a-select-option>
            <a-select-option value="beta">Z-A</a-select-option>
            <a-select-option value="random">Ngẫu nhiên</a-select-option>
          </a-select>
        </div>
        <div class="word-counter" v-if="words.length > 0">
          {{ words.length }} từ (Trang {{ currentPage }})
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
            @click="showWordDetail(word._id)"
          >
            <div class="word-body">{{ word.body }}</div>
          </div>
        </div>

        <div class="pagination" v-if="words.length > 0">
          <a-button 
            @click="goToPreviousPage" 
            :disabled="currentPage === 1 || loading" 
            type="default" 
            size="large"
            style="margin-right: 12px;"
          >
            ← Trước
          </a-button>
          <span class="page-info">Trang {{ currentPage }}</span>
          <a-button 
            @click="goToNextPage" 
            :disabled="!hasMore || loading" 
            type="primary" 
            size="large"
            style="margin-left: 12px;"
          >
            Tiếp →
          </a-button>
        </div>
      </div>
    </div>

    <!-- Back to top button for scroll container -->
    <div class="back-to-top" v-if="showBackToTop" @click="scrollToTop">
      <a-button type="primary" shape="circle" size="large">
        ↑
      </a-button>
    </div>

    <!-- Modal chi tiết từ vựng -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Chi tiết từ vựng</h2>
          <div class="header-actions">
            <a-button 
              type="primary" 
              shape="circle" 
              size="large" 
              class="speak-button" 
              @click="speakWord"
              :disabled="!wordDetail"
              title="Đọc từ vựng"
            >
              🔊
            </a-button>
            <a-button 
              type="default"
              shape="circle"
              size="large"
              class="bookmark-button"
              @click="bookmarkWord"
              :disabled="!wordDetail"
              title="Bookmark từ này"
              style="margin-left: 8px;"
            >
              ⭐
            </a-button>
            <button @click="closeModal" class="close-btn">&times;</button>
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

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { wordService } from '../services/wordService'

// Reactive data
const words = ref([])
const loading = ref(false)
const loadingDetail = ref(false)
const searchKeyword = ref('')
const orderBy = ref('')
const currentPage = ref(1)
const limit = ref(50)
const hasMore = ref(true)

// Back to top
const showBackToTop = ref(false)

// Modal
const showModal = ref(false)
const wordDetail = ref(null)

// Methods
const loadWords = async (page = 1) => {
  loading.value = true
  
  try {
    const offset = (page - 1) * limit.value
    const params = {
      keyword: searchKeyword.value || undefined,
      orderBy: orderBy.value || undefined,
      offset: offset,
      limit: limit.value
    }
    const response = await wordService.getWordSummary(params)
    
    words.value = response // Thay thế hoàn toàn, không cộng dồn
    currentPage.value = page
    
    // Kiểm tra còn trang tiếp theo không
    hasMore.value = response.length === limit.value
    
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

const bookmarkWord = async () => {
  if (!wordDetail.value || !wordDetail.value._id) return;
  try {
    await wordService.bookmarkWord(wordDetail.value._id, true);
    window.$message ? window.$message.success('Đã bookmark!') : alert('Đã bookmark!');
  } catch (e) {
    window.$message ? window.$message.error('Bookmark thất bại!') : alert('Bookmark thất bại!');
  }
}

const handleSortChange = () => {
  currentPage.value = 1
  hasMore.value = true
  loadWords(1)
}

const goToNextPage = () => {
  if (!hasMore.value || loading.value) return
  loadWords(currentPage.value + 1)
  scrollToTop()
}

const goToPreviousPage = () => {
  if (currentPage.value === 1 || loading.value) return
  loadWords(currentPage.value - 1)
  scrollToTop()
}

const showWordDetail = async (wordId) => {
  showModal.value = true
  loadingDetail.value = true
  wordDetail.value = null
  
  try {
    const detail = await wordService.getWordDetail(wordId)
    wordDetail.value = detail
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

const formatWordContent = (content) => {
  if (!content) return ''
  return content.replace(/\\n/g, '<br>')
}

// 🟢 Hàm đọc từ tiếng Anh đầu tiên với giọng Anh-Mỹ
const speakWord = () => {
  if (!wordDetail.value || !wordDetail.value.body) return;

  // Regex lấy từ tiếng Anh đầu tiên
  const match = wordDetail.value.body.match(/[a-zA-Z]+/);
  if (!match) return;

  const wordToSpeak = match[0];
  const utterance = new SpeechSynthesisUtterance(wordToSpeak);
  
  // Chỉ dùng giọng Anh-Mỹ
  utterance.lang = 'en-US';
  utterance.rate = 0.85; // Tốc độ vừa phải
  utterance.pitch = 1.0; // Cao độ bình thường
  utterance.volume = 0.9; // Âm lượng
  
  console.log(`🔊 Speaking "${wordToSpeak}" with American English voice`);
  
  speechSynthesis.speak(utterance);
};

// Back to top functionality
const scrollToTop = () => {
  const scrollContainer = document.querySelector('.vocabulary-scroll-container')
  if (scrollContainer) {
    scrollContainer.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

const handleScroll = (event) => {
  const scrollContainer = event.target
  showBackToTop.value = scrollContainer.scrollTop > 500
}

// Lifecycle
onMounted(() => {
  loadWords(1)
  // Add scroll listener to the scroll container
  const scrollContainer = document.querySelector('.vocabulary-scroll-container')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const scrollContainer = document.querySelector('.vocabulary-scroll-container')
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.vocabulary-list {
  height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100vw;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  flex-shrink: 0;
  background: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(10px);
  z-index: 100;
  padding: 15px 20px 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.vocabulary-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px 20px 80px 20px;
}

.header h1 {
  color: #ffffff;
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.search-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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

.loading p {
  margin-top: 16px;
  font-size: 16px;
}

.vocabulary-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.vocabulary-item {
  background: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  width: 100%;
}

.vocabulary-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  border: 1px solid #667eea;
  background: #2a2a2a;
}

.word-body {
  font-size: 16px;
  line-height: 1.5;
  color: #ffffff;
  white-space: pre-line;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  padding: 20px 0;
  gap: 12px;
}

.page-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  font-weight: 500;
  padding: 0 16px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  max-width: 600px;
  width: 85%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: #2a2a2a;
}

.modal-header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.speak-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.speak-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.speak-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 15px 18px 18px 18px;
  max-height: 70vh;
  overflow-y: auto;
  background: #1a1a1a;
}

.detail-content {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #ffffff;
  margin: 0;
  word-wrap: break-word;
  white-space: normal;
}

.error {
  text-align: center;
  color: #ff6b6b;
  padding: 20px;
  font-size: 16px;
}

/* Back to top button */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.back-to-top .ant-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 18px;
  font-weight: bold;
}

/* Responsive */
@media (max-width: 768px) {
  .vocabulary-list {
    height: 100vh;
  }

  .header {
    padding: 15px;
  }

  .header h1 {
    font-size: 24px;
    margin-bottom: 15px;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .search-filter {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .search-filter .ant-input-search {
    width: 100% !important;
    margin-right: 0 !important;
  }

  .search-filter .ant-select {
    width: 100% !important;
    margin-right: 0 !important;
  }

  .vocabulary-scroll-container {
    padding: 10px;
  }

  .vocabulary-list-container {
    gap: 8px;
  }

  .vocabulary-item {
    padding: 10px 12px;
  }

  .word-body {
    font-size: 14px;
    line-height: 1.4;
  }

  .modal-content {
    width: 95%;
    max-height: 92vh;
    margin: 10px;
  }

  .modal-header {
    padding: 15px;
  }

  .modal-body {
    padding: 15px;
  }

  .back-to-top {
    bottom: 20px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .vocabulary-list {
    height: 100vh;
  }
  
  .header h1 {
    font-size: 20px;
  }

  .vocabulary-list-container {
    gap: 6px;
  }

  .vocabulary-item {
    padding: 8px 10px;
    border-radius: 6px;
  }

  .word-body {
    font-size: 13px;
    line-height: 1.3;
  }

  .vocabulary-scroll-container {
    padding: 8px;
  }

  .header {
    padding: 10px;
  }

  .controls {
    gap: 10px;
  }

  .search-filter {
    gap: 8px;
  }
}
</style>