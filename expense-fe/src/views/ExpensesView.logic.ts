import { ref, onMounted, computed, watch } from 'vue';
import { expenseService } from '../services/expenseService';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import dayjs from 'dayjs';
import { API_BASE_URL } from '../config';

export const auth = useAuthStore();
export const expenses = ref([]);
export const users = ref<any[]>([]);
export const categories = ref<any[]>([]);
export const statuses = ref<any[]>([]);
export const selectedUserId = ref('');
export const filterMonth = ref(dayjs()); // dayjs object
export const filterCategory = ref('');
export const filterStatus = ref('');
export const dialogVisible = ref(false);
export const editId = ref<string | null>(null);
export const form = ref({
  title: '',
  amount: 0,
  category: '',
  status: '',
  description: '',
  date: dayjs(),
  userId: '',
  forUserId: '',
});
export const loading = ref(false);

export const columns = [
  { title: 'Ngày', dataIndex: 'date', key: 'date',
    customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD') : '' },
  { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
  { title: 'Số tiền', dataIndex: 'amount', key: 'amount',
    customRender: ({ text }: any) => text ? Number(text).toLocaleString() + ' đ' : '' },
  { title: 'Danh mục', dataIndex: 'category', key: 'category' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
  { title: 'Mô tả', dataIndex: 'description', key: 'description' },
  { title: 'Hành động', key: 'actions' }
];

export const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${API_BASE_URL}/users`);
    users.value = res.data;
    if (!selectedUserId.value) {
      if (auth.user && auth.user.id) {
        selectedUserId.value = auth.user.id;
      } else if (users.value.length > 0) {
        selectedUserId.value = users.value[0].id;
      }
    }
  } finally {
    loading.value = false;
  }
};

export const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${API_BASE_URL}/categories`);
    categories.value = res.data;
  } finally {
    loading.value = false;
  }
};

export const fetchStatuses = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${API_BASE_URL}/statuses`);
    statuses.value = res.data;
  } finally {
    loading.value = false;
  }
};

export const fetchExpenses = async () => {
  if (!selectedUserId.value || !filterMonth.value) return;
  loading.value = true;
  try {
    const month = filterMonth.value.month() + 1;
    const year = filterMonth.value.year();
    const res = await axios.get(
      `${API_BASE_URL}/expenses/user/${selectedUserId.value}`,
      { params: { month, year } }
    );
    expenses.value = res.data;
  } finally {
    loading.value = false;
  }
};

export const useExpensesInit = () => {
  onMounted(() => {
    fetchUsers();
    fetchCategories();
    fetchStatuses();
  });
  watch([selectedUserId, filterMonth], () => {
    fetchExpenses();
  });
};

export const getCategoryName = (catId: string) => {
  const found = categories.value.find((c) => c.id === catId);
  return found ? found.name : catId;
};
export const getStatusName = (statusId: string) => {
  const found = statuses.value.find((s) => s.id === statusId);
  return found ? found.name : statusId;
};

export const openAdd = () => {
  editId.value = null;
  const defaultStatus = statuses.value.find(s => s.name === 'Đã chi tiêu');
  Object.assign(form.value, {
    title: '',
    amount: 0,
    category: '',
    status: defaultStatus ? defaultStatus.id : '',
    description: '',
    date: dayjs(),
    userId: auth.user.id,
    forUserId: selectedUserId.value,
  });
  dialogVisible.value = true;
};

export const openEdit = (row: any) => {
  editId.value = row.id;
  Object.assign(form.value, { ...row, date: row.date ? dayjs(row.date) : dayjs() });
  dialogVisible.value = true;
};

export const onSubmit = async () => {
  loading.value = true;
  try {
    const data = { ...form.value, date: form.value.date ? dayjs(form.value.date).toISOString() : null, userId: auth.user.id };
    if (editId.value) {
      await expenseService.update(editId.value, data);
    } else {
      await expenseService.create(data);
    }
    dialogVisible.value = false;
    await fetchExpenses();
  } finally {
    loading.value = false;
  }
};

export const onDelete = async (id: string) => {
  loading.value = true;
  try {
    await expenseService.delete(id);
    await fetchExpenses();
  } finally {
    loading.value = false;
  }
};

export const filteredExpenses = computed(() => {
  let data = expenses.value;
  if (filterMonth.value) {
    data = data.filter((e: any) => {
      if (!e.date) return false;
      const m = dayjs(e.date).format('YYYY-MM');
      return m === filterMonth.value.format('YYYY-MM');
    });
  }
  if (filterCategory.value) {
    data = data.filter((e: any) => e.category === filterCategory.value);
  }
  if (filterStatus.value) {
    data = data.filter((e: any) => e.status === filterStatus.value);
  }
  return data;
});

export const totalAmount = computed(() => {
  return filteredExpenses.value.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
}); 



export const formatCurrency = (value: any) => {
    if (!value) return '';
    const number = Number(value);
    if (isNaN(number)) return '';
    return `${number.toLocaleString('vi-VN')} đ`;
  };
  
  export  const parseCurrency = (value: any) => {
    if (!value) return '';
    return value.replace(/[^\d]/g, '');
  };
  