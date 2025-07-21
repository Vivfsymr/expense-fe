<template>
  <div class="app-header">
    <div class="header-left">
    </div>
    <a-menu mode="horizontal" :selectedKeys="[selectedKey]" class="header-menu" @click="onMenuClick">
      <a-menu-item key="expenses">Chi tiêu</a-menu-item>
      <a-menu-item key="dashboard">Dashboard</a-menu-item>
    </a-menu>
    <div class="header-user" v-if="user">
      <a-avatar :size="32" style="margin-right: 8px; background: #1677ff;">
        {{ user?.name ? user.name.charAt(0) : '' }}
      </a-avatar>
      <span class="header-username">{{ user.name }}</span>
      <a-button size="small" @click="logout" class="logout-btn">Đăng xuất</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';

const auth = useAuthStore();
const { user } = storeToRefs(auth);
const router = useRouter();
const route = useRoute();

const selectedKey = computed(() => {
  if (route.path.startsWith('/expenses')) return 'expenses';
  if (route.path.startsWith('/users')) return 'users';
  if (route.path.startsWith('/dashboard')) return 'dashboard';
  return '';
});

const onMenuClick = (e: any) => {
  if (e.key === 'expenses') router.push('/expenses');
  if (e.key === 'users') router.push('/users');
  if (e.key === 'dashboard') router.push('/dashboard');
};

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<style scoped>
.app-header {
  background: #27ae60;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 32px;
  box-shadow: 0 2px 8px 0 #f0f1f2;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 10;
}
.header-left {
  display: flex;
  align-items: center;
}
.header-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  margin-right: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}
.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #1677ff;
  letter-spacing: 1px;
}
.header-menu {
  flex: 1;
  margin: 0 32px;
  min-width: 300px;
  background: transparent;
  border-bottom: none;
}
.header-user {
  display: flex;
  align-items: center;
  gap: 4px;
}
.header-username {
  color: #222;
  font-weight: 500;
  margin-right: 8px;
}
.logout-btn {
  border-radius: 6px;
  background: #f0f1f2;
  color: #1677ff;
  font-weight: 500;
  border: none;
  transition: background 0.2s, color 0.2s;
}
.logout-btn:hover {
  background: #1677ff;
  color: #fff;
}
:deep(.ant-menu-item-selected) {
  color: #fff !important;
}
</style> 