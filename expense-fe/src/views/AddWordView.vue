<template>
  <div class="add-word-view">
    <h1>Thêm từ mới</h1>
    <textarea v-model="body" rows="20" cols="80" placeholder="Paste nội dung body ở đây..."></textarea>
    <br />
    <button @click="submit" :disabled="loading">Gửi</button>
    <div v-if="success" style="color: green; margin-top: 10px;">Đã lưu thành công!</div>
    <div v-if="error" style="color: red; margin-top: 10px;">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const body = ref('');
const loading = ref(false);
const success = ref(false);
const error = ref('');

async function submit() {
  loading.value = true;
  success.value = false;
  error.value = '';
  try {
    const formData = new FormData();
    formData.append('body', body.value);
    await axios.post('https://expense-be-dwhg.onrender.com/api/words/form', formData);
    success.value = true;
    body.value = '';
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Có lỗi xảy ra!';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.add-word-view {
  max-width: 700px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
textarea {
  width: 100%;
  font-size: 1rem;
  margin-bottom: 12px;
}
button {
  padding: 8px 24px;
  font-size: 1rem;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
