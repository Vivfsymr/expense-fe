

<template>
  <div :class="$style.wrapper">
    <div :class="$style.filterRow">
      <a-select v-model:value="selectedUserId" style="width: 180px; margin-right: 12px;" placeholder="Chọn người dùng">
        <a-select-option v-for="u in users" :key="u.id" :value="u.id">
          {{ u.name }}
        </a-select-option>
      </a-select>
      <a-date-picker v-model:value="filterMonth" picker="month" format="MM/YYYY" style="width: 160px; margin-right: 12px;" />
    </div>
    <a-card>
      <div :class="$style.filterRow">
        <a-select v-model:value="filterCategory" style="width: 160px;" placeholder="Lọc danh mục">
          <a-select-option value="">Tất cả danh mục</a-select-option>
          <a-select-option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</a-select-option>
        </a-select>
        <a-select v-model:value="filterStatus" style="width: 160px;" placeholder="Lọc trạng thái">
          <a-select-option value="">Tất cả trạng thái</a-select-option>
          <a-select-option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</a-select-option>
        </a-select>
        <a-button type="primary" @click="openAdd">Thêm chi tiêu</a-button>
      </div>
      <div>Tổng số tiền: {{ totalAmount.toLocaleString() }} đ</div>
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
    </a-card>
    <a-modal v-model:open="dialogVisible" :title="editId ? 'Sửa chi tiêu' : 'Thêm chi tiêu'" @ok="onSubmit" @cancel="() => dialogVisible = false">
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
                  :formatter="value => formatCurrency(value)"
                  :parser="value => parseCurrency(value)"
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
        <a-form-item label="Mô tả">
          <a-input v-model:value="form.description" placeholder="Nhập mô tả" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>



<script setup lang="ts">
import {
  auth, expenses, users, categories, statuses, selectedUserId, filterMonth, filterCategory, filterStatus, dialogVisible, editId, form, loading, columns, filteredExpenses, getCategoryName, getStatusName, openAdd, openEdit, onSubmit, onDelete, useExpensesInit, totalAmount, formatCurrency, parseCurrency
} from './ExpensesView.logic';
import $style from './ExpensesView.module.css';

useExpensesInit(); // GỌI HÀM NÀY để khởi tạo fetch API và watcher!
</script> 