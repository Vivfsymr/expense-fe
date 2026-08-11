<template>
  <div class="app-header">
    <div class="header-left" role="button" tabindex="0" @click="go('/flashcard')" @keydown.enter.prevent="go('/flashcard')">
      <img class="header-logo" src="/favicon.svg" alt="" width="28" height="28" />
    </div>

    <nav class="header-nav" aria-label="Main">
      <button
        v-for="item in menuItems"
        :key="item.key"
        type="button"
        class="nav-item"
        :class="{ active: selectedKey === item.key }"
        @click="go(item.path)"
      >
        {{ item.label }}
      </button>
    </nav>

    <div class="header-user" v-if="user">
      <a-avatar :size="avatarSize" class="header-avatar">
        {{ user?.name ? user.name.charAt(0) : '' }}
      </a-avatar>
      <span class="header-username">{{ user.name }}</span>
      <a-button size="small" @click="logout" class="logout-btn">
        <span class="logout-full">Đăng xuất</span>
        <span class="logout-short">Thoát</span>
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const router = useRouter()
const route = useRoute()

const isMobile = ref(false)

const menuItems = [
  { key: 'flashcard', label: 'Flashcard', path: '/flashcard' },
  { key: 'vocabulary', label: 'Từ vựng', path: '/vocabulary' },
  { key: 'quiz', label: 'Luyện từ', path: '/quiz' },
  { key: 'lookup', label: 'Tra nghĩa', path: '/lookup' },
  { key: 'add-word', label: 'Thêm từ', path: '/add-word' },
]

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

const avatarSize = computed(() => (isMobile.value ? 28 : 32))

const selectedKey = computed(() => {
  if (route.path.startsWith('/flashcard')) return 'flashcard'
  if (route.path.startsWith('/vocabulary')) return 'vocabulary'
  if (route.path.startsWith('/quiz')) return 'quiz'
  if (route.path.startsWith('/lookup')) return 'lookup'
  if (route.path.startsWith('/add-word')) return 'add-word'
  return ''
})

const go = (path: string) => {
  router.push(path)
}

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  background: rgb(3, 3, 3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--app-header-height, 50px);
  padding: 0 16px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  gap: 8px;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  cursor: pointer;
}

.header-logo {
  width: 28px;
  height: 28px;
  display: block;
  border-radius: 7px;
  flex-shrink: 0;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fafafa;
  white-space: nowrap;
}

.header-nav {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
  touch-action: pan-x;
}

.header-nav::-webkit-scrollbar {
  display: none;
}

.nav-item {
  flex: 0 0 auto;
  border: none;
  background: transparent;
  color: #fafafa;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  line-height: 1.2;
}

.nav-item.active {
  color: #69b1ff;
  background: rgba(105, 177, 255, 0.12);
}

.header-user {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.header-avatar {
  background: #1677ff;
  flex-shrink: 0;
}

.header-username {
  color: #f1f1f1;
  font-weight: 500;
  margin-right: 4px;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  border-radius: 6px;
  background: #f0f1f2;
  color: #090a0b;
  font-weight: 500;
  border: none;
}

.logout-short {
  display: none;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 8px;
    gap: 6px;
  }

  .header-logo {
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }

  .header-title {
    font-size: 14px;
    letter-spacing: 0;
  }

  .header-username {
    display: none;
  }

  .logout-full {
    display: none;
  }

  .logout-short {
    display: inline;
  }

  .logout-btn {
    padding: 0 8px;
    font-size: 12px;
    height: 28px;
  }

  .nav-item {
    font-size: 13px;
    padding: 6px 10px;
  }
}

@media (max-width: 380px) {
  .header-title {
    display: none;
  }

  .nav-item {
    font-size: 12px;
    padding: 6px 8px;
  }
}
</style>
