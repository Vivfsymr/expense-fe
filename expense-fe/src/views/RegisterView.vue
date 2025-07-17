<template>
  <div style="max-width: 400px; margin: 48px auto;">
    <a-card>
      <h2 style="text-align:center;">Đăng ký</h2>
      <a-form layout="vertical" :model="form" @submit.prevent="onRegister">
        <a-form-item label="Tên đăng nhập">
          <a-input v-model:value="form.username" placeholder="Tên đăng nhập" />
        </a-form-item>
        <a-form-item label="Mật khẩu">
          <a-input-password v-model:value="form.password" placeholder="Mật khẩu" />
        </a-form-item>
        <a-form-item label="Email">
          <a-input v-model:value="form.email" placeholder="Email" />
        </a-form-item>
        <a-form-item label="Tên hiển thị">
          <a-input v-model:value="form.name" placeholder="Tên hiển thị" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading">Đăng ký</a-button>
          <a-button type="link" @click="$router.push('/login')">Đăng nhập</a-button>
        </a-form-item>
        <a-alert v-if="error" type="error" :message="error" show-icon style="margin-top: 10px" />
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const form = ref({ username: '', password: '', email: '', name: '' });
const loading = ref(false);
const error = ref('');

const onRegister = async () => {
  error.value = '';
  loading.value = true;
  try {
    await auth.register(form.value);
    router.push('/login');
  } catch (e: any) {
    error.value = e.message || 'Đăng ký thất bại';
  } finally {
    loading.value = false;
  }
};
</script> 