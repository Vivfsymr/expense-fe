<template>
  <div class="flashcard-container">
    <div v-if="loading" class="loading">
      <a-spin size="large" />
      <p>Đang tải từ vựng...</p>
    </div>

    <div v-else-if="words.length > 0" class="flashcard-wrapper">
      <div class="controls-top">
        <div class="search-filter">
          <a-input-search
            v-model:value="searchKeyword"
            class="search-input"
            placeholder="Tìm kiếm..."
            @search="searchWords"
            @pressEnter="searchWords"
          />
          <a-select
            v-model:value="sortOrder"
            class="sort-select"
            @change="handleSortChange"
            placeholder="Sắp xếp"
          >
            <a-select-option value="newest">Mới nhất</a-select-option>
            <a-select-option value="oldest">Cũ nhất</a-select-option>
            <a-select-option value="alpha">A-Z</a-select-option>
            <a-select-option value="beta">Z-A</a-select-option>
            <a-select-option value="random">Ngẫu nhiên</a-select-option>
          </a-select>
          <div class="page-nav">
            <a-button @click="goToPreviousPage" v-if="currentPage > 1" type="default" ghost size="small">
              ←
            </a-button>
            <a-button @click="goToNextPage" v-if="hasMore" type="default" ghost size="small">
              →
            </a-button>
          </div>
        </div>
        <div class="card-counter">
          {{ currentIndex + 1 }}/{{ words.length }} · Trang {{ currentPage }} · Tổng {{ total }}
        </div>
      </div>

      <div
        class="flashcard"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="card-inner">
          <div class="card-front" ref="cardFrontRef">
            <div class="word-content" v-html="formatWordContent(currentWord?.body || '')"></div>
            <div class="card-actions">
              <a-button
                type="primary"
                shape="circle"
                size="large"
                class="speak-button"
                @click="speakWord"
                title="Đọc từ vựng"
              >
                🔊
              </a-button>
              <a-button
                shape="circle"
                size="large"
                class="detail-button"
                @click="showDetail"
                :disabled="!currentWord"
                title="Chi tiết từ vựng"
              >
                ℹ
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <a-empty description="Không có từ vựng nào" />
    </div>

    <WordDetailModal
      :word-id="detailId"
      @close="closeDetail"
      @deleted="onWordDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { useFlashcard } from '../composables/useFlashcard'
import { formatWordContent } from '../utils/formatWord'
import WordDetailModal from '../components/WordDetailModal.vue'

const {
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
  detailId,
  showDetail,
  closeDetail,
  onWordDeleted,
  goToNextPage,
  goToPreviousPage,
  searchWords,
  handleSortChange,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} = useFlashcard()
</script>

<style scoped>
.flashcard-container {
  height: calc(100vh - var(--app-header-height, 50px));
  height: calc(100dvh - var(--app-header-height, 50px));
  width: 100%;
  max-width: 100vw;
  position: fixed;
  top: var(--app-header-height, 50px);
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  background: var(--app-bg);
  box-sizing: border-box;
  overflow: hidden;
}

.loading {
  text-align: center;
  color: white;
}

.flashcard-wrapper {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 16px;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
}

.controls-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  flex-shrink: 0;
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
  width: 200px;
}

.sort-select {
  width: 140px;
}

.page-nav {
  display: flex;
  gap: 6px;
}

.card-counter {
  color: white;
  font-size: 14px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  white-space: nowrap;
}

.flashcard {
  width: 100%;
  flex: 1;
  min-height: 0;
  perspective: 1000px;
  user-select: none;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.card-front {
  width: 100%;
  height: 100%;
  border-radius: 15px;
  padding: 28px 24px 72px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #1a1a1a;
  color: #ffffff;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.word-content {
  font-size: 16px;
  line-height: 1.6;
  text-align: left;
  width: 100%;
  color: #ffffff;
  word-break: break-word;
}

.word-content :deep(.check-mark) {
  color: #52c41a;
  font-weight: bold;
}

.word-content :deep(.arrow) {
  color: #40a9ff;
  font-weight: bold;
  margin: 0 5px;
}

.word-content :deep(.pronunciation) {
  color: #b37feb;
  font-weight: bold;
}

.word-content :deep(.word-type) {
  background: #2a2a2a;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  color: #d9d9d9;
  border: 1px solid #404040;
}

.no-data {
  background: #1a1a1a;
  color: #ffffff;
  padding: 40px 24px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin: 16px;
  max-width: 90vw;
}

.card-actions {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.speak-button {
  background: rgba(64, 169, 255, 0.9) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.detail-button {
  background: #fff !important;
  color: #333 !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .flashcard-wrapper {
    padding: 10px;
    gap: 8px;
  }

  .controls-top {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .search-filter {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 100px auto;
    gap: 6px;
    align-items: center;
  }

  .search-input {
    width: 100% !important;
  }

  .sort-select {
    width: 100% !important;
  }

  .page-nav {
    justify-content: flex-end;
  }

  .card-counter {
    align-self: flex-end;
    font-size: 12px;
    padding: 4px 10px;
  }

  .card-front {
    padding: 16px 14px 64px;
  }

  .word-content {
    font-size: 14px;
    line-height: 1.45;
  }

  .card-actions {
    bottom: 12px;
    right: 12px;
  }
}

@media (max-width: 480px) {
  .search-filter {
    grid-template-columns: 1fr 88px auto;
  }

  .word-content {
    font-size: 13px;
  }

  .no-data {
    padding: 24px 16px;
  }
}
</style>
