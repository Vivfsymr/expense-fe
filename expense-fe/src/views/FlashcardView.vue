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
          <div class="card-front">
            <div class="word-content" v-html="formatWordContent(currentWord.body)"></div>
            <div class="speech-controls">
              <a-button 
                @click="speakText" 
                :loading="isSpeaking" 
                type="primary" 
                shape="circle"
                size="large"
                class="speak-btn"
                :title="isSpeaking ? 'Đang đọc...' : 'Đọc từ tiếng Anh đầu tiên'"
              >
                <template #icon>
                  <span v-if="!isSpeaking">🔊</span>
                  <span v-else>⏸️</span>
                </template>
              </a-button>
              <a-button 
                @click="stopSpeaking" 
                v-if="isSpeaking"
                type="default" 
                shape="circle"
                class="stop-btn"
                title="Dừng đọc"
              >
                <template #icon>⏹️</template>
              </a-button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="controls">
        <a-button @click="previousCard" :disabled="currentIndex === 0" type="primary" ghost>
          <template #icon><LeftOutlined /></template>
          Trước
        </a-button>
        
        <a-button @click="loadMoreWords" v-if="hasMore" type="default" ghost>
          Tải thêm
        </a-button>
        
        <a-button @click="nextCard" :disabled="currentIndex === words.length - 1" type="primary">
          Tiếp
          <template #icon><RightOutlined /></template>
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
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

const words = ref<Word[]>([]);
const currentIndex = ref(0);
const loading = ref(true);
const searchKeyword = ref('');
const sortOrder = ref<'alpha' | 'beta' | 'newest' | 'oldest' | 'random'>('newest');
const currentOffset = ref(0);
const limit = ref(50);
const hasMore = ref(true);

// Speech synthesis
const isSpeaking = ref(false);
const currentUtterance = ref<SpeechSynthesisUtterance | null>(null);

// Touch handling for swipe
const touchStartX = ref(0);
const touchEndX = ref(0);
const touchStartY = ref(0);
const touchEndY = ref(0);

const currentWord = computed(() => words.value[currentIndex.value]);

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
  stopSpeaking(); // Dừng đọc khi chuyển thẻ
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++;
  }
};

const previousCard = () => {
  stopSpeaking(); // Dừng đọc khi chuyển thẻ
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// Speech synthesis functions
const speakText = () => {
  if (!currentWord.value) return;
  
  // Check if browser supports speech synthesis
  if (!('speechSynthesis' in window)) {
    alert('Trình duyệt không hỗ trợ đọc text');
    return;
  }
  
  // Stop current speech if any
  stopSpeaking();
  
  // Get clean text and extract first word
  const cleanText = currentWord.value.body
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/✅/g, '') // Remove checkmarks
    .replace(/→/g, '') // Remove arrows
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  if (!cleanText) return;
  
  // Extract first English word only
  const firstEnglishWord = cleanText.match(/\b[a-zA-Z]+\b/);
  
  if (!firstEnglishWord) {
    console.log('No English word found');
    return;
  }
  
  const wordToSpeak = firstEnglishWord[0];
  console.log('Speaking first English word:', wordToSpeak);
  
  // Create utterance for English
  const utterance = new SpeechSynthesisUtterance(wordToSpeak);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.volume = 1;
  
  utterance.onstart = () => {
    isSpeaking.value = true;
  };
  
  utterance.onend = () => {
    isSpeaking.value = false;
  };
  
  utterance.onerror = (error) => {
    console.error('Speech error:', error);
    isSpeaking.value = false;
  };
  
  currentUtterance.value = utterance;
  speechSynthesis.speak(utterance);
};

const stopSpeaking = () => {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  isSpeaking.value = false;
  currentUtterance.value = null;
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
    if (e.key === 'ArrowLeft') {
      previousCard();
    } else if (e.key === 'ArrowRight') {
      nextCard();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      speakText();
    } else if (e.key === 'Escape') {
      stopSpeaking();
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
* {
  box-sizing: border-box;
}

.flashcard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
  width: 100vw;
  overflow-x: hidden;
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
  height: 800px;
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

.speech-controls {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 8px;
  z-index: 5;
}

.speak-btn {
  background: #1890ff !important;
  border-color: #1890ff !important;
}

.speak-btn:hover {
  background: #40a9ff !important;
  border-color: #40a9ff !important;
}

.stop-btn {
  background: #ff4d4f !important;
  border-color: #ff4d4f !important;
  color: white !important;
}

.stop-btn:hover {
  background: #ff7875 !important;
  border-color: #ff7875 !important;
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

/* Mobile responsive */
@media (max-width: 768px) {
  .flashcard-container {
    padding: 0;
    margin: 0;
  }
  
  .flashcard-wrapper {
    padding: 10px;
    max-width: 100%;
  }
  
  .flashcard {
    height: 450px;
  }
  
  .card-front {
    padding: 25px;
  }
  
  .word-content {
    font-size: 14px;
  }
  
  .controls-top {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter {
    justify-content: center;
  }
  
  .search-filter .ant-input-search {
    width: 100% !important;
    max-width: 250px;
  }
  
  .search-filter .ant-select {
    width: 120px !important;
  }
  
  .speech-controls {
    top: 10px;
    right: 10px;
    gap: 5px;
  }
  
  .speech-controls .ant-btn {
    width: 35px !important;
    height: 35px !important;
  }
  
  .controls {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
