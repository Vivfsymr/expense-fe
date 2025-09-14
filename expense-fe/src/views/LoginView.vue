<template>
  <div style="max-width: 400px; margin: 48px auto;">
    <a-card>
      <h2 style="text-align:center;">Đăng nhập</h2>
      <a-form layout="vertical" :model="form" @submit.prevent="onLogin">
        <a-form-item label="Tên đăng nhập">
          <a-input v-model:value="form.username" placeholder="Tên đăng nhập" />
        </a-form-item>
        <a-form-item label="Mật khẩu">
          <a-input-password v-model:value="form.password" placeholder="Mật khẩu" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading">Đăng nhập</a-button>
          <a-button type="link" @click="$router.push('/register')">Đăng ký</a-button>
        </a-form-item>
        <a-alert v-if="error" type="error" :message="error" show-icon style="margin-top: 10px" />
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const form = ref({ username: '', password: '' });
const loading = ref(false);
const error = ref('');

const onLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(form.value.username, form.value.password);
    router.push('/vocabulary');
  } catch (e) {
    error.value = e.message || 'Đăng nhập thất bại';
  } finally {
    loading.value = false;
  }
};
</script> 