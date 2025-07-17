<template>
  <div style="max-width: 600px; margin: 48px auto;">
    <a-card>
      <h2>Chào mừng đến với Expense Manager!</h2>
      <p>Đây là trang quản lý chi tiêu cá nhân và nhóm. Hãy chọn mục <b>Chi tiêu</b> ở menu để bắt đầu quản lý các khoản chi của bạn.</p>
      <a-button type="primary" @click="$router.push('/expenses')">Đến trang Chi tiêu</a-button>
    </a-card>
  </div>
</template>

<script setup lang="ts">
// Không cần gì thêm
</script> 