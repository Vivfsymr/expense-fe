<template>
  <div style="max-width: 900px; margin: 48px auto;">
    <a-card>
      <h2>Tổng quan chi tiêu tháng {{ currentMonth }}</h2>
      <div style="display: flex; gap: 32px; flex-wrap: wrap; margin: 24px 0;">
        <a-statistic title="Tổng số khoản chi" :value="totalCount" />
        <a-statistic title="Tổng số tiền" :value="totalAmount" :precision="0" suffix="₫" />
      </div>
      <a-empty description="Biểu đồ tổng quan sẽ hiển thị ở đây (phát triển sau)" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { expenseService } from '../services/expenseService';
import { useAuthStore } from '../stores/auth';
import dayjs from 'dayjs';

const auth = useAuthStore();
const expenses = ref([]);
const currentMonth = dayjs().format('MM/YYYY');

const fetchExpenses = async () => {
  if (!auth.user) return;
  const res = await expenseService.getByUser(auth.user.id);
  expenses.value = res;
};

const filteredExpenses = computed(() => {
  return expenses.value.filter((e: any) => {
    if (!e.date) return false;
    return dayjs(e.date).format('MM/YYYY') === currentMonth;
  });
});

const totalCount = computed(() => filteredExpenses.value.length);
const totalAmount = computed(() => filteredExpenses.value.reduce((sum: number, e: any) => sum + (e.amount || 0), 0));

onMounted(() => {
  fetchExpenses();
});
</script> 