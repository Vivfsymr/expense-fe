<template>
  <div class="app-header">
    <div class="header-left">
      <span class="header-title">Vocab</span>
    </div>
    <a-menu mode="horizontal" :selectedKeys="[selectedKey]" class="header-menu" @click="onMenuClick">
      <a-menu-item key="flashcard">Flashcard</a-menu-item>
      <a-menu-item key="vocabulary">Từ vựng</a-menu-item>
      <a-menu-item key="lookup">Tra nghĩa</a-menu-item>
      <a-menu-item key="add-word">Thêm từ</a-menu-item>
    </a-menu>
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
  if (route.path.startsWith('/lookup')) return 'lookup'
  if (route.path.startsWith('/add-word')) return 'add-word'
  return ''
})

const onMenuClick = (e: { key: string }) => {
  if (e.key === 'flashcard') router.push('/flashcard')
  if (e.key === 'vocabulary') router.push('/vocabulary')
  if (e.key === 'lookup') router.push('/lookup')
  if (e.key === 'add-word') router.push('/add-word')
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
  padding: 0 20px;
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
  flex-shrink: 0;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fafafa;
  white-space: nowrap;
}

.header-menu {
  flex: 1;
  min-width: 0;
  margin: 0 12px;
  background: transparent;
  border-bottom: none;
  line-height: var(--app-header-height, 50px);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.header-menu::-webkit-scrollbar {
  display: none;
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

:deep(.ant-menu-item) {
  color: #fafafa !important;
  background: transparent !important;
  padding-inline: 12px !important;
}

:deep(.ant-menu-item-selected) {
  color: #69b1ff !important;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 8px;
    gap: 4px;
  }

  .header-title {
    font-size: 14px;
    letter-spacing: 0;
  }

  .header-menu {
    margin: 0 4px;
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

  :deep(.ant-menu-item) {
    padding-inline: 8px !important;
    font-size: 13px !important;
  }

  :deep(.ant-menu-overflow-item) {
    padding-inline: 8px !important;
  }
}

@media (max-width: 380px) {
  .header-title {
    display: none;
  }

  :deep(.ant-menu-item) {
    padding-inline: 6px !important;
    font-size: 12px !important;
  }
}
</style>
