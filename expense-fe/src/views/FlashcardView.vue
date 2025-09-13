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
            placeholder="Tìm kiếm từ vựng..."
            @search="searchWords"
            @pressEnter="searchWords"
            style="width: 200px; margin-right: 10px;"
          />
          <a-select
            v-model:value="sortOrder"
            @change="handleSortChange"
            style="width: 150px;"
            placeholder="Sắp xếp"
          >
            <a-select-option value="newest">Mới nhất</a-select-option>
            <a-select-option value="oldest">Cũ nhất</a-select-option>
            <a-select-option value="alpha">A-Z</a-select-option>
            <a-select-option value="beta">Z-A</a-select-option>
            <a-select-option value="random">Ngẫu nhiên</a-select-option>
          </a-select>
        </div>
        <div class="card-counter">
          {{ currentIndex + 1 }} / {{ words.length }}
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
            <div class="word-content" v-html="formatWordContent(currentWord.body)"></div>
            <a-button 
              type="primary" 
              shape="circle" 
              size="large" 
              class="speak-button" 
              @click="speakWord"
            >
              🔊
            </a-button>
          </div>
        </div>
      </div>
      
      <div class="controls">
        <a-button @click="loadMoreWords" v-if="hasMore" type="default" ghost>
          Tải thêm
        </a-button>
      </div>
    </div>
    
    <div v-else class="no-data">
      <a-empty description="Không có từ vựng nào" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { wordService, type Word, type WordQueryParams } from '../services/wordService';
import dayjs from 'dayjs';

const words = ref<Word[]>([]);
const currentIndex = ref(0);
const loading = ref(true);
const searchKeyword = ref('');
const sortOrder = ref<'alpha' | 'beta' | 'newest' | 'oldest' | 'random'>('newest');
const currentOffset = ref(0);
const limit = ref(50);
const hasMore = ref(true);
const cardFrontRef = ref<HTMLDivElement | null>(null);

// Touch handling for swipe
const touchStartX = ref(0);
const touchEndX = ref(0);
const touchStartY = ref(0);
const touchEndY = ref(0);

const currentWord = computed(() => words.value[currentIndex.value]);

// 🟢 Hàm đọc từ tiếng Anh đầu tiên
const speakWord = () => {
  if (!currentWord.value || !currentWord.value.body) return;

  // Regex lấy từ tiếng Anh đầu tiên
  const match = currentWord.value.body.match(/[a-zA-Z]+/);
  if (!match) return;

  const wordToSpeak = match[0];
  const utterance = new SpeechSynthesisUtterance(wordToSpeak);
  utterance.lang = 'en-US';
  utterance.rate = 0.9; // tốc độ đọc (0.1 - 10)
  speechSynthesis.speak(utterance);
};

const loadWords = async (reset: boolean = false) => {
  try {
    loading.value = true;
    
    const params: WordQueryParams = {
      orderBy: sortOrder.value,
      offset: reset ? 0 : currentOffset.value,
      limit: limit.value
    };
    
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim();
    }
    
    const data = await wordService.getWords(params);
    
    if (reset) {
      words.value = data;
      currentIndex.value = 0;
      currentOffset.value = data.length;
    } else {
      words.value = [...words.value, ...data];
      currentOffset.value += data.length;
    }
    
    hasMore.value = data.length === limit.value;
  } catch (error) {
    console.error('Error loading words:', error);
  } finally {
    loading.value = false;
  }
};


// 2. Tạo hàm scroll to top
const scrollToTop = () => {
  if (cardFrontRef.value && cardFrontRef.value.scrollTo) {
    cardFrontRef.value.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scroll hoặc 'auto' cho instant
    });
  } else if (cardFrontRef.value) {
    // Fallback cho browser cũ
    cardFrontRef.value.scrollTop = 0;
  }
};

const loadMoreWords = async () => {
  await loadWords(false);
};

const searchWords = async () => {
  await loadWords(true);
};

const handleSortChange = async () => {
  await loadWords(true);
};

const nextCard = () => {
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++;
    // Scroll to top sau khi chuyển card
    setTimeout(() => {
      scrollToTop();
    }, 50); // Delay nhỏ để đảm bảo DOM đã update
  }
};

const previousCard = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    // Scroll to top sau khi chuyển card
    setTimeout(() => {
      scrollToTop();
    }, 50); // Delay nhỏ để đảm bảo DOM đã update
  }
};

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
};

const handleTouchMove = (e: TouchEvent) => {
  // Không preventDefault để cho phép scroll dọc
};

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].clientX;
  touchEndY.value = e.changedTouches[0].clientY;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeThreshold = 50;
  const swipeDistanceX = touchStartX.value - touchEndX.value;
  const swipeDistanceY = Math.abs(touchStartY.value - touchEndY.value);
  
  console.log('Swipe X:', swipeDistanceX, 'Swipe Y:', swipeDistanceY);
  
  // Chỉ xử lý swipe ngang nếu khoảng cách ngang > dọc
  if (Math.abs(swipeDistanceX) > swipeThreshold && Math.abs(swipeDistanceX) > swipeDistanceY) {
    if (swipeDistanceX > 0) {
      // Swipe left - next card
      console.log('Swiping to next card');
      nextCard();
    } else {
      // Swipe right - previous card
      console.log('Swiping to previous card');
      previousCard();
    }
  }
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

const formatWordContent = (content: string) => {
  // Format the word content with better styling
  return content
    .replace(/\\n/g, '<br>') // Handle escaped newlines from API
    .replace(/\n/g, '<br>') // Handle actual newlines
    .replace(/\r\n/g, '<br>') // Handle Windows line endings
    .replace(/\r/g, '<br>') // Handle Mac line endings
    .replace(/✅/g, '<span class="check-mark">✅</span>')
    .replace(/→/g, '<span class="arrow">→</span>')
    .replace(/(\w+\s*\/[^\/]+\/)/g, '<span class="pronunciation">$1</span>')
    .replace(/(\(noun\)|\(verb\)|\(adjective\)|\(adverb\))/gi, '<span class="word-type">$1</span>');
};

onMounted(() => {
  loadWords(true);
  
  // Add keyboard support
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'j' || e.key === 'J') {
      // j = previous card (giống vim)
      previousCard();
    } else if (e.key === 'l' || e.key === 'L') {
      // l = next card (giống vim)
      nextCard();
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  
  // Cleanup
  return () => {
    document.removeEventListener('keydown', handleKeydown);
  };
});
</script>

<style scoped>
 /* Reset toàn bộ margin/padding mặc định */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  height: 100%;
  overflow: hidden; /* Ẩn scrollbar */
}

* {
  box-sizing: border-box;
}

/* CSS DESKTOP - Bỏ viền trắng */
.flashcard-container {
  min-height: 100vh;
  height: 100vh; /* Chiếm đủ chiều cao */
  width: 100vw; /* Chiếm đủ chiều rộng */
  position: fixed; /* Fix position để tránh scroll */
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
  overflow: hidden; /* Ẩn overflow */
}

.loading {
  text-align: center;
  color: white;
}

.flashcard-wrapper {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
  height: 100vh; /* Chiếm đủ chiều cao */
}

.controls-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.search-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.card-counter {
  color: white;
  font-size: 18px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.flashcard {
  width: 100%;
  height: 940px;
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
  padding: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #1a1a1a;
  color: #ffffff;
  overflow-y: auto;
  position: relative;
}

.word-content {
  font-size: 16px;
  line-height: 1.6;
  text-align: left;
  width: 100%;
  color: #ffffff;
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

.word-details {
  text-align: left;
  width: 100%;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.swipe-hint {
  color: white;
  font-size: 14px;
  text-align: center;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 15px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.no-data {
  background: #1a1a1a;
  color: #ffffff;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* MOBILE RESPONSIVE - Bỏ viền trắng + Hiện tất cả controls trên 1 dòng */
@media (max-width: 768px) {
  .flashcard-container {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height */
    height: 100vh;
    height: 100dvh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }
  
  .flashcard-wrapper {
    padding: 10px;
    max-width: 100%;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
  }
  
  .controls-top {
    flex-shrink: 0;
    flex-direction: row; /* Hiển thị ngang trên 1 dòng */
    align-items: center;
    justify-content: space-between; /* Căn đều 2 bên */
    margin-bottom: 10px;
    padding: 0 5px;
    gap: 5px; /* Giảm gap để tiết kiệm không gian */
    flex-wrap: nowrap; /* QUAN TRỌNG: Không cho xuống dòng */
    width: 100%;
    overflow: hidden; /* Ẩn overflow nếu quá dài */
  }
  
  .flashcard {
    height: calc(100dvh - 100px); /* Giảm trừ ít hơn vì controls gọn hơn */
    flex: 1;
    min-height: 500px;
  }
  
  .card-front {
    padding: 20px;
    height: 100%;
  }
  
  .word-content {
    font-size: 16px;
    line-height: 1.7;
  }
  
  .search-filter {
    display: flex;
    align-items: center;
    gap: 5px; /* Giảm gap để tiết kiệm không gian */
    flex-wrap: nowrap; /* Không cho xuống dòng */
    flex-shrink: 1; /* Cho phép thu nhỏ nếu cần */
    min-width: 0; /* Cho phép thu nhỏ xuống 0 */
  }
  
  /* Hiện lại search input trên mobile nhưng thu nhỏ */
  .search-filter .ant-input-search {
    display: block !important; /* Force hiển thị */
    width: 100px !important; /* Thu nhỏ search box hơn nữa */
    flex-shrink: 1;
    min-width: 80px; /* Width tối thiểu */
  }
  
  .search-filter .ant-input {
    display: block !important; /* Force input bên trong */
  }
  
  /* Thu nhỏ sort dropdown */
  .search-filter .ant-select {
    display: block !important; /* Force hiển thị */
    width: 90px !important; /* Thu nhỏ dropdown hơn */
    flex-shrink: 1;
    min-width: 80px;
  }
  
  /* Hiện lại card counter nhưng thu nhỏ */
  .card-counter {
    display: block !important; /* Force hiển thị */
    color: white;
    font-size: 12px !important; /* Giảm font size nhiều hơn */
    font-weight: bold;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px !important; /* Giảm padding nhiều hơn */
    border-radius: 10px;
    backdrop-filter: blur(10px);
    white-space: nowrap; /* Không xuống dòng */
    flex-shrink: 0; /* Không cho thu nhỏ counter */
    visibility: visible !important; /* Force visible */
    min-width: fit-content; /* Width vừa đủ nội dung */
  }
  
  .controls {
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
    margin-top: 10px;
  }
  
  /* Speak button trên mobile */
  .speak-button {
    position: absolute !important;
    bottom: 20px !important;
    right: 20px !important;
    z-index: 10;
  }
}

/* Màn hình rất nhỏ - responsive hơn cho controls */
@media (max-width: 480px) {
  .flashcard {
    height: calc(100dvh - 90px); /* Giảm trừ ít hơn */
  }
  
  .flashcard-container {
    padding: 0;
  }
  
  .flashcard-wrapper {
    padding: 5px;
  }
  
  .card-front {
    padding: 15px;
  }
  
  .word-content {
    font-size: 15px;
  }
  
  /* Controls nhỏ hơn cho màn hình rất nhỏ */
  .search-filter .ant-input-search {
    display: block !important; /* Force hiển thị */
    width: 90px !important; /* Thu nhỏ hơn nữa */
  }
  
  .search-filter .ant-input {
    display: block !important;
  }
  
  .search-filter .ant-select {
    display: block !important;
    width: 80px !important;
  }
  
  .card-counter {
    display: block !important;
    font-size: 11px !important;
    padding: 3px 6px !important;
    visibility: visible !important;
  }
}
</style>