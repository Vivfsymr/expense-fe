<template>
  <div style="max-width: 900px; margin: 48px auto;">
    <a-card>
      <h2>Danh sách người dùng</h2>
      <a-table :dataSource="users" :columns="columns" rowKey="id" :loading="loading" style="margin-top: 24px;">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-button size="small" @click="openEdit(record)" style="margin-right: 8px;">Sửa</a-button>
            <a-button size="small" danger @click="onDelete(record.id)">Xoá</a-button>
          </template>
        </template>
      </a-table>
      <a-modal v-model:open="dialogVisible" :title="'Sửa thông tin người dùng'" @ok="onSubmit" @cancel="() => dialogVisible = false">
        <a-form :model="form" layout="vertical">
          <a-form-item label="Email">
            <a-input v-model:value="form.email" placeholder="Email" />
          </a-form-item>
          <a-form-item label="Tên hiển thị">
            <a-input v-model:value="form.name" placeholder="Tên hiển thị" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

const users = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const editId = ref<string | null>(null);
const form = ref({ email: '', name: '' });

const columns = [
  { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Tên hiển thị', dataIndex: 'name', key: 'name' },
  { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
  { title: 'Hành động', key: 'actions' }
];

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await api.get('/api/users');
    if (res.data && res.data.success) {
      users.value = res.data.data;
    } else {
      users.value = [];
    }
  } finally {
    loading.value = false;
  }
};

const openEdit = (row: any) => {
  editId.value = row.id;
  form.value.email = row.email;
  form.value.name = row.name;
  dialogVisible.value = true;
};

const onSubmit = async () => {
  if (!editId.value) return;
  await api.put(`/api/users/${editId.value}`, form.value);
  dialogVisible.value = false;
  fetchUsers();
};

const onDelete = async (id: string) => {
  await api.delete(`/api/users/${id}`);
  fetchUsers();
};

onMounted(() => {
  fetchUsers();
});
</script> 