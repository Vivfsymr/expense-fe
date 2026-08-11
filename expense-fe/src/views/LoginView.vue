<template>
  <div class="auth-page">
    <a-card class="auth-card">
      <h2 class="auth-title">Đăng nhập</h2>
      <a-form layout="vertical" :model="form" @submit.prevent="onLogin">
        <a-form-item label="Tên đăng nhập">
          <a-input v-model:value="form.username" placeholder="Tên đăng nhập" size="large" />
        </a-form-item>
        <a-form-item label="Mật khẩu">
          <a-input-password v-model:value="form.password" placeholder="Mật khẩu" size="large" />
        </a-form-item>
        <a-form-item>
          <div class="auth-actions">
            <a-button type="primary" html-type="submit" :loading="loading" size="large" block>
              Đăng nhập
            </a-button>
          </div>
        </a-form-item>
        <a-alert v-if="error" type="error" :message="error" show-icon style="margin-top: 10px" />
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

const onLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form.value.username, form.value.password)
    router.push('/vocabulary')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  width: 100%;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-title {
  text-align: center;
  margin-bottom: 16px;
}

.auth-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
}
</style>
