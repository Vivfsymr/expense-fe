<template>
  <div :class="$style.wrapper">
    <div style="flex-direction: row; display: flex; justify-content: space-between; align-items: center;">
      <div style="margin-bottom: 16px; font-size: 16px; font-weight: bold; color: #18ff8b;">
        Số tiền còn lại: {{ realExpenses.toLocaleString() }} đ
      </div>
      <div :class="$style.filterRow">
        <a-date-picker v-model:value="filterMonth" picker="month" format="MM/YYYY" style="width: 160px; margin-right: 12px;" />
        <a-select v-model:value="selectedUserId" style="width: 180px; margin-right: 12px;" placeholder="Chọn người dùng">
          <a-select-option v-for="u in users" :key="u.id" :value="u.id">
            {{ u.name }}
          </a-select-option>
        </a-select>
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
              <div style="display: flex; gap: 8px;">
                <a-button type="primary" @click="openAdd">Thêm chi tiêu</a-button>
                <a-button type="default" @click="exportExpensesExcel">Export Excel</a-button>
              </div>
            </div>
            <div style="color: #00831c;">Tổng số tiền: {{ totalAmount.toLocaleString() }} đ</div>
          </div>
          <div class="scroll-table">
            <a-table
              :dataSource="filteredExpenses"
              :columns="columnsWithRowSpan"
              :loading="loading"
              rowKey="id"
              :pagination="false"
              :class="$style.table"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'category'">
                  <span
                    :data-category="getCategoryName(record.category)"
                    :style="{ color: '#fff', padding: '2px 10px', borderRadius: '8px', fontWeight: 500 }"
                  >
                    {{ getCategoryName(record.category) }}
                  </span>
                </template>
                <template v-else-if="column.key === 'status'">
                  {{ getStatusName(record.status) }}
                </template>
                <template v-else-if="column.key === 'actions'">
                  <a-button size="small" @click="openEdit(record)" style="margin-right: 8px;">Sửa</a-button>
                  <a-popconfirm
                    title="Bạn có chắc chắn muốn xóa chi tiêu này?"
                    ok-text="Có"
                    cancel-text="Không"
                    @confirm="onDelete(record.id)"
                  >
                    <a-button size="small" danger>Xoá</a-button>
                  </a-popconfirm>
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
            <div style="color: #00831c;">Tổng thu nhập: {{ totalIncomeAmount.toLocaleString() }} đ</div>
            <div style="display: flex; gap: 8px;">
              <a-button type="primary" @click="openAddIncome">Thêm thu nhập</a-button>
              <a-button type="default" @click="exportIncomeExcel">Export Excel</a-button>
            </div>
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
                <a-popconfirm
                  title="Bạn có chắc chắn muốn xóa thu nhập này?"
                  ok-text="Có"
                  cancel-text="Không"
                  @confirm="onDeleteIncome(record.id)"
                >
                  <a-button size="small" danger>Xoá</a-button>
                </a-popconfirm>
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
  dialogVisibleIncome, editIncomeId, incomeForm, openAddIncome, openEditIncome, onSubmitIncome, onDeleteIncome, realExpenses, resetExpensesState,
  exportExpensesExcel, exportIncomeExcel
} from './ExpensesView.logic';
import $style from './ExpensesView.module.css';
import { ref, watch, onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import { useAuthStore } from '../stores/auth';
import {  onBeforeUnmount } from 'vue';

const activeTab = ref('expenses');
const auth = useAuthStore();

// Chỉ gọi setupExpensesWatchers 1 lần duy nhất
setupExpensesWatchers();

const columnsWithRowSpan = computed(() => {
  return columns.map(col => {
    if (col.key === 'date') {
      return {
        ...col,
        customRender({ text, record, index }: { text: any; record: any; index: number }) {
          const currentDate = dayjs(record.date).format('YYYY-MM-DD');
          const all = filteredExpenses.value as any[];
          const firstIndex = all.findIndex(e => dayjs(e.date).format('YYYY-MM-DD') === currentDate);
          const rowSpan = all.filter(e => dayjs(e.date).format('YYYY-MM-DD') === currentDate).length;
          if (index === firstIndex) {
            return {
              children: dayjs(text).format('YYYY-MM-DD'),
              props: { rowSpan }
            };
          }
          return {
            children: '',
            props: { rowSpan: 0 }
          };
        }
      };
    }
    return col;
  });
});

onMounted(async () => {
  resetExpensesState();
  if (auth.user) {
    await useExpensesInit();
    setDashboardLayoutContentPadding();
  window.addEventListener('resize', setDashboardLayoutContentPadding);
  }
});

function setDashboardLayoutContentPadding() {
  const layoutContent = document.querySelector('.expenses-layout-content') as HTMLElement | null;
  if (layoutContent) {
    layoutContent.style.padding = '60px 16px 16px 16px';
    layoutContent.style.minHeight = 'calc(100vh - 80px)';
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', setDashboardLayoutContentPadding);
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
  background: #fff;
  padding-top: 8px;
  padding-bottom: 8px;
}
.scroll-table {
  max-height: 630px;
  overflow-y: auto;
}
:deep(.ant-table-thead > tr > th),
:deep(.ant-table-tbody > tr > td) {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  padding-left: 6px !important;
  padding-right: 6px !important;
  font-size: 12px !important;
}
:deep(.ant-table-tbody > tr > td) {
  line-height: 1.05 !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Ăn uống"]) {
  background: #43e97b !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Mua sắm"]) {
  background: #f7971e !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Đi lại"]) {
  background: #f857a6 !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Khác"]) {
  background: #a18cd1 !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Tích lũy"]) {
  background: #43cea2 !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Cho vay"]) {
  background: #fa709a !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Nợ"]) {
  background: #224168 !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Tiền nhà"]) {
  background: #f9d423 !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Học tập"]) {
  background: #30cfd0 !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Điện thoại"]) {
  background: #f5576c !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Sức khỏe"]) {
  background: #6a82fb !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Thú cưng"]) {
  background: #fbc2eb !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Cưới xin / Giỗ chạp"]) {
  background: #fdc830 !important;
}
:deep(.ant-table-tbody .ant-table-cell span[data-category="Du lịch"]) {
  background: #43c6ac !important;
}
:deep(.ant-tabs-tab) {
  color: #ffffff !important;
}
:deep(.ant-tabs-tab-active) {
  color: #1890ff !important;
}
</style> 