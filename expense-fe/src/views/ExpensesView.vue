

<template>
  <div :class="$style.wrapper">
    <div style="flex-direction: row; display: flex; justify-content: space-between; align-items: center;">
      <div style="margin-bottom: 16px; font-size: 16px; font-weight: bold; color: #1890ff;">
        Số tiền còn lại: {{ realExpenses.toLocaleString() }} đ
      </div>
      <div :class="$style.filterRow">
        <a-select v-model:value="selectedUserId" style="width: 180px; margin-right: 12px;" placeholder="Chọn người dùng">
          <a-select-option v-for="u in users" :key="u.id" :value="u.id">
            {{ u.name }}
          </a-select-option>
        </a-select>
        <a-date-picker v-model:value="filterMonth" picker="month" format="MM/YYYY" style="width: 160px; margin-right: 12px;" />
      </div>
      </div>
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="expenses" tab="Chi tiêu">
        <a-card>
          <div class="sticky-toolbar">
            <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div style="gap: 12px; display: flex; justify-content: space-between; align-items: center;">
                <a-select v-model:value="filterCategory" style="width: 160px;" placeholder="Lọc danh mục">
                  <a-select-option value="">Tất cả danh mục</a-select-option>
                  <a-select-option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</a-select-option>
                </a-select>
                <a-select v-model:value="filterStatus" style="width: 160px;" placeholder="Lọc trạng thái">
                  <a-select-option value="">Tất cả trạng thái</a-select-option>
                  <a-select-option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</a-select-option>
                </a-select>
              </div>
              <a-button type="primary" @click="openAdd">Thêm chi tiêu</a-button>
            </div>
            <div>Tổng số tiền: {{ totalAmount.toLocaleString() }} đ</div>
          </div>
          <div class="scroll-table">
            <a-table :dataSource="filteredExpenses" :columns="columns" :loading="loading" rowKey="id" :pagination="false" :class="$style.table">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'category'">
                  {{ getCategoryName(record.category) }}
                </template>
                <template v-else-if="column.key === 'status'">
                  {{ getStatusName(record.status) }}
                </template>
                <template v-else-if="column.key === 'actions'">
                  <a-button size="small" @click="openEdit(record)" style="margin-right: 8px;">Sửa</a-button>
                  <a-button size="small" danger @click="onDelete(record.id)">Xoá</a-button>
                </template>
              </template>
            </a-table>
            <a-empty v-if="!filteredExpenses.length && !loading" description="Không có chi tiêu trong tháng này" :class="$style.empty" />
          </div>
        </a-card>
        <a-modal v-model:open="dialogVisible" :title="editId ? 'Sửa chi tiêu' : 'Thêm chi tiêu'" @ok="onSubmit" @cancel="() => dialogVisible = false" :confirm-loading="loading" :ok-button-props="{ disabled: loading }">
          <a-form :model="form" layout="vertical">
            <a-form-item label="Ngày">
              <a-date-picker v-model:value="form.date" style="width: 100%;" />
            </a-form-item>
            <a-form-item label="Tiêu đề">
              <a-input v-model:value="form.title" placeholder="Nhập tiêu đề" />
            </a-form-item>
            <a-form-item label="Số tiền">
              <a-input-number
                v-model:value="form.amount"
                style="width: 100%;"
                placeholder="Nhập số tiền"
                :formatter="(value: any) => formatCurrency(value)"
                :parser="(value: any) => parseCurrency(value)"
              />
            </a-form-item>
            <a-form-item label="Danh mục">
              <a-select v-model:value="form.category" placeholder="Chọn danh mục">
                <a-select-option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="Trạng thái">
              <a-select v-model:value="form.status" placeholder="Chọn trạng thái">
                <a-select-option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </a-modal>
      </a-tab-pane>
      <a-tab-pane key="income" tab="Thu nhập">
       
        <a-card>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>Tổng thu nhập: {{ totalIncomeAmount.toLocaleString() }} đ</div>
            <a-button type="primary" @click="openAddIncome">Thêm thu nhập</a-button>
          </div>
          <a-table :dataSource="filteredIncome" :columns="incomeColumns" :loading="loading" rowKey="id" :pagination="false" :class="$style.table">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'category'">
                {{ getCategoryName(record.category) }}
              </template>
              <template v-else-if="column.key === 'status'">
                {{ getStatusName(record.status) }}
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-button size="small" @click="openEditIncome(record)" style="margin-right: 8px;">Sửa</a-button>
                <a-button size="small" danger @click="onDeleteIncome(record.id)">Xoá</a-button>
              </template>
            </template>
          </a-table>
          <a-empty v-if="!filteredIncome.length && !loading" description="Không có thu nhập trong tháng này" :class="$style.empty" />
        </a-card>
        <a-modal v-model:open="dialogVisibleIncome" :title="editIncomeId ? 'Sửa thu nhập' : 'Thêm thu nhập'" @ok="onSubmitIncome" @cancel="() => dialogVisibleIncome = false" :confirm-loading="loading" :ok-button-props="{ disabled: loading }">
          <a-form :model="incomeForm" layout="vertical">
            <a-form-item label="Ngày">
              <a-date-picker v-model:value="incomeForm.date" style="width: 100%;" />
            </a-form-item>
            <a-form-item label="Tiêu đề">
              <a-input v-model:value="incomeForm.title" placeholder="Nhập tiêu đề" />
            </a-form-item>
            <a-form-item label="Số tiền">
              <a-input-number
                v-model:value="incomeForm.amount"
                style="width: 100%;"
                placeholder="Nhập số tiền"
                :formatter="(value: any) => formatCurrency(value)"
                :parser="(value: any) => parseCurrency(value)"
              />
            </a-form-item>
          </a-form>
        </a-modal>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import {
  expenses, users, categories, statuses, selectedUserId, filterMonth, filterCategory, filterStatus, dialogVisible, editId, form, loading, columns, incomeColumns, filteredExpenses, getCategoryName, getStatusName, openAdd, openEdit, onSubmit, onDelete, useExpensesInit, setupExpensesWatchers, totalAmount, formatCurrency, parseCurrency,
  income, selectedIncomeUserId, fetchIncome, filteredIncome, totalIncomeAmount,
  dialogVisibleIncome, editIncomeId, incomeForm, openAddIncome, openEditIncome, onSubmitIncome, onDeleteIncome, realExpenses, resetExpensesState
} from './ExpensesView.logic';
import $style from './ExpensesView.module.css';
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const activeTab = ref('expenses');
const auth = useAuthStore();

// Chỉ gọi setupExpensesWatchers 1 lần duy nhất
setupExpensesWatchers();

onMounted(async () => {
  resetExpensesState();
  if (auth.user) {
    await useExpensesInit();
  }
});

// Watcher để theo dõi thay đổi của auth.user, chỉ fetch khi user đổi
watch(() => auth.user, async (newUser, oldUser) => {
  if (newUser && newUser !== oldUser) {
    resetExpensesState();
    await useExpensesInit();
  }
});

</script> 

<style scoped>
.sticky-toolbar {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #18191a;
  padding-top: 8px;
  padding-bottom: 8px;
}
.scroll-table {
  max-height: 630px;
  overflow-y: auto;
}
</style> 