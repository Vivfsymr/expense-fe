<template>
  <div :class="$style.wrapper">
    <a-spin :spinning="loading" :class="$style.dashboardSpin">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
      <span style="font-size: 20px; font-weight: bold; color: #d4ff47;" > Năm</span>
      <a-select v-model:value="selectedYear" style="width: 120px;" @change="fetchDashboard">
        <a-select-option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</a-select-option>
      </a-select>
    </div>
    <div class="dashboard-summary">
      <div class="summary-cards">
        <a-card class="summary-card">
          <div class="summary-label">Tổng chi tiêu</div>
          <div class="summary-value expense">{{ dashboard?.totalYearAmountExpense?.toLocaleString() }} đ</div>
        </a-card>
        <a-card class="summary-card">
          <div class="summary-label">Tổng thu nhập</div>
          <div class="summary-value income">{{ dashboard?.totalYearAmountIncome?.toLocaleString() }} đ</div>
        </a-card>
      </div>
      <a-card class="chart-card">
        <v-chart :option="chartOption" autoresize style="height: 320px;" />
      </a-card>
    </div>
    <a-card>
      <a-table :dataSource="dashboard?.summaryMonths || []" :columns="monthColumns" rowKey="nameOfMonth" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-button size="small" @click="openMonthDetail(record)">Chi tiết</a-button>
          </template>
          <template v-else-if="column.key === 'totalMonthAmountExpense'">
            {{ record.totalMonthAmountExpense.toLocaleString() }} đ
          </template>
          <template v-else-if="column.key === 'totalMonthAmountIncome'">
            {{ record.totalMonthAmountIncome.toLocaleString() }} đ
          </template>
          <template v-else-if="column.key === 'totalMonthAmountRealExpense'">
            {{ record.totalMonthAmountRealExpense.toLocaleString() }} đ
          </template>
        </template>
      </a-table>
    </a-card>
    <a-modal v-model:open="monthDetailVisible" :title="'Chi tiết danh mục tháng ' + (selectedMonth?.nameOfMonth || '') + '/' + selectedYear" @cancel="monthDetailVisible = false" :footer="null">
      <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">
        <div v-for="category in selectedMonth?.eachSummaryMonthOfCategories || []" :key="category.nameOfCategory" 
             style="background: #f5f5f5; padding: 8px 12px; border-radius: 6px; min-width: 120px; text-align: center; flex-shrink: 0;">
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">{{ category.nameOfCategory }}</div>
          <div style="font-size: 14px; font-weight: bold; color: #f5222d;">{{ category.totalCategoryAmountExpense.toLocaleString() }} đ</div>
        </div>
      </div>
    </a-modal>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';
import $style from './ExpensesView.module.css';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { API_BASE_URL } from '../config';
import { useRoute } from 'vue-router';

// Register ECharts components
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

const auth = useAuthStore();
const selectedYear = ref(new Date().getFullYear().toString());
const yearOptions = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
const dashboard = ref<any>(null);
const loading = ref(false);

const fetchDashboard = async () => {
  if (!auth.user?.id) {
    console.log('No user found, skipping fetch');
    return;
  }
  console.log('Fetching dashboard for user:', auth.user.id, 'year:', selectedYear.value);
  loading.value = true;
  try {
    const url = `${API_BASE_URL}/DashBoard/${auth.user.id}?year=${selectedYear.value}`;
    console.log('API URL:', url);
    const res = await axios.get(url);
    console.log('Dashboard response:', res.data);
    dashboard.value = res.data;
  } catch (error) {
    console.error('Error fetching dashboard:', error);
  } finally {
    loading.value = false;
  }
};

function setDashboardLayoutContentPadding() {
  const layoutContent = document.querySelector('.dashboard-layout-content') as HTMLElement | null;
  if (layoutContent) {
    layoutContent.style.padding = '400px 16px 16px 16px';
    layoutContent.style.minHeight = 'calc(100vh - 80px)';
  }
}

onMounted(() => {
  fetchDashboard();
  setDashboardLayoutContentPadding();
  window.addEventListener('resize', setDashboardLayoutContentPadding);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', setDashboardLayoutContentPadding);
});

// Biểu đồ ECharts option
const chartOption = computed(() => {
  if (!dashboard.value) return {};
  const months = dashboard.value.summaryMonths.map((m: any) => m.nameOfMonth);
  const expenses = dashboard.value.summaryMonths.map((m: any) => m.totalMonthAmountExpense);
  const incomes = dashboard.value.summaryMonths.map((m: any) => m.totalMonthAmountIncome);
  const realExpenses = dashboard.value.summaryMonths.map((m: any) => m.totalMonthAmountRealExpense);
  
  console.log('Chart data:', { months, expenses, incomes, realExpenses });
  
  return {
    tooltip: { 
      trigger: 'axis',
      formatter: function(params: any) {
        let result = params[0].axisValue + '<br/>';
        params.forEach((param: any) => {
          result += param.marker + param.seriesName + ': ' + param.value.toLocaleString() + ' đ<br/>';
        });
        return result;
      }
    },
    legend: { data: ['Chi tiêu', 'Thu nhập', 'Còn lại'] },
    xAxis: { type: 'category', data: months },
    yAxis: { 
      type: 'value',
      axisLabel: {
        formatter: function(value: any) {
          return (value / 1000000).toFixed(0) + 'M';
        }
      }
    },
    series: [
      { name: 'Chi tiêu', type: 'bar', data: expenses, itemStyle: { color: '#f5222d' } },
      { name: 'Thu nhập', type: 'bar', data: incomes, itemStyle: { color: '#52c41a' } },
      { name: 'Còn lại', type: 'line', data: realExpenses, itemStyle: { color: '#1890ff' } },
    ]
  };
});

// Bảng tháng
const monthColumns = [
  { title: 'Tháng', dataIndex: 'nameOfMonth', key: 'nameOfMonth' },
  { title: 'Tổng chi tiêu', dataIndex: 'totalMonthAmountExpense', key: 'totalMonthAmountExpense' },
  { title: 'Tổng thu nhập', dataIndex: 'totalMonthAmountIncome', key: 'totalMonthAmountIncome' },
  { title: 'Còn lại', dataIndex: 'totalMonthAmountRealExpense', key: 'totalMonthAmountRealExpense' },
  { title: '', key: 'actions' }
];

// Bảng danh mục
const categoryColumns = [
  { title: 'Danh mục', dataIndex: 'nameOfCategory', key: 'nameOfCategory' },
  { title: 'Số tiền', dataIndex: 'totalCategoryAmountExpense', key: 'totalCategoryAmountExpense' }
];

// Modal chi tiết tháng
const monthDetailVisible = ref(false);
const selectedMonth = ref<any>(null);
const openMonthDetail = (month: any) => {
  selectedMonth.value = month;
  monthDetailVisible.value = true;
};
</script>

<style scoped>
.wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 0;
  min-height: 100vh;
  overflow-y: auto;
}

.dashboard-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.summary-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 200px;
}

.summary-card {
  text-align: center;
}

.summary-label {
  font-size: 16px;
  color: #888;
}

.summary-value {
  font-size: 28px;
  font-weight: bold;
}

.summary-value.expense {
  color: #f5222d;
}

.summary-value.income {
  color: #52c41a;
}

.chart-card {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-summary {
    flex-direction: column;
    gap: 16px;
  }
  
  .summary-cards {
    flex-direction: row;
    min-width: auto;
  }
  
  .summary-card {
    flex: 1;
  }
  
  .summary-value {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    flex-direction: column;
  }
  
  .summary-value {
    font-size: 18px;
  }
}
</style> 