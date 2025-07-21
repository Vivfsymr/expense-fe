import { ref, onMounted, computed, watch } from 'vue';
import { expenseService } from '../services/expenseService';
import api from '../services/api';
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
export const income = ref([]);
export const selectedIncomeUserId = ref('');
export const realExpenses = ref(0);

export const resetExpensesState = () => {
  expenses.value = [];
  users.value = [];
  categories.value = [];
  statuses.value = [];
  selectedUserId.value = '';
  filterCategory.value = '';
  filterStatus.value = '';
  dialogVisible.value = false;
  editId.value = null;
  form.value = {
    title: '',
    amount: 0,
    category: '',
    status: '',
    description: '',
    date: dayjs(),
    userId: '',
    forUserId: '',
  };
  loading.value = false;
  income.value = [];
  selectedIncomeUserId.value = '';
  realExpenses.value = 0;
  dialogVisibleIncome.value = false;
  editIncomeId.value = null;
  incomeForm.value = {
    id: '',
    title: '',
    amount: 0,
    category: '',
    status: '',
    description: '',
    date: dayjs(),
    userId: '',
    forUserId: '',
  };
};

export const dialogVisibleIncome = ref(false);
export const editIncomeId = ref<string | null>(null);
export const incomeForm = ref({
  id: '',
  title: '',
  amount: 0,
  category: '',
  status: '',
  description: '',
  date: dayjs(),
  userId: '',
  forUserId: '',
});

export const columns = [
  { title: 'Ngày', dataIndex: 'date', key: 'date',
    customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD') : '' },
  { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
  { title: 'Số tiền', dataIndex: 'amount', key: 'amount',
    customRender: ({ text }: any) => text ? Number(text).toLocaleString() + ' đ' : '' },
  { title: 'Danh mục', dataIndex: 'category', key: 'category' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
  { title: 'Hành động', key: 'actions' }
];

export const incomeColumns = [
  { title: 'Ngày', dataIndex: 'date', key: 'date',
    customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD') : '' },
  { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
  { title: 'Số tiền', dataIndex: 'amount', key: 'amount',
    customRender: ({ text }: any) => text ? Number(text).toLocaleString() + ' đ' : '' },
  { title: 'Hành động', key: 'actions' }
];

export const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await api.get(`${API_BASE_URL}/users`);
    if (res.data && res.data.success) {
      users.value = res.data.data;
    } else {
      users.value = [];
      // Có thể hiển thị thông báo lỗi ở đây nếu muốn
    }
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
    const res = await api.get(`${API_BASE_URL}/categories`);
    if (res.data && res.data.success) {
      categories.value = res.data.data;
    } else {
      categories.value = [];
    }
  } finally {
    loading.value = false;
  }
};

export const fetchStatuses = async () => {
  loading.value = true;
  try {
    const res = await api.get(`${API_BASE_URL}/statuses`);
    if (res.data && res.data.success) {
      statuses.value = res.data.data;
    } else {
      statuses.value = [];
    }
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
    const res = await api.get(
      `${API_BASE_URL}/expenses/getByQuery/${selectedUserId.value}`,
      { params: { month, year } }
    );
    if (res.data && res.data.success) {
      expenses.value = res.data.data;
    } else {
      expenses.value = [];
    }
  } finally {
    loading.value = false;
  }
};

export const fetchIncome = async () => {
  if (!selectedUserId.value || !filterMonth.value) return;
  loading.value = true;
  try {
    const month = filterMonth.value.month() + 1;
    const year = filterMonth.value.year();
    const res = await api.get(
      `${API_BASE_URL}/incomes/getByQuery/${selectedUserId.value}`,
      { params: { month, year } }
    );
    if (res.data && res.data.success) {
      income.value = res.data.data;
    } else {
      income.value = [];
    }
  } finally {
    loading.value = false;
  }
};

export const fetchRealExpenses = async () => {
  if (!selectedUserId.value || !filterMonth.value) return;
  loading.value = true;
  try {
    const month = filterMonth.value.month() + 1;
    const year = filterMonth.value.year();
    const res = await api.get(`${API_BASE_URL}/expenses/RealExpenses/${selectedUserId.value}`, {
      params: { month, year }
    });
    if (res.data && res.data.success) {
      realExpenses.value = res.data.data;
    } else {
      realExpenses.value = 0;
    }
  } finally {
    loading.value = false;
  }
};

export const useExpensesInit = async () => {
  console.log('useExpensesInit called');
  await fetchUsers();
  console.log('After fetchUsers, selectedUserId:', selectedUserId.value);
  await fetchCategories();
  await fetchStatuses();
  // KHÔNG gọi fetchIncome ở đây nữa!
};

export const setupExpensesWatchers = () => {
  watch([selectedUserId, filterMonth], () => {
    if (selectedUserId.value) {
    fetchExpenses();
    fetchIncome();
    fetchRealExpenses();
    }
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
    if (!editId.value && typeof (data as any).id !== 'undefined') {
      delete (data as any).id;
    }
    if (editId.value) {
      await expenseService.update(editId.value, data);
    } else {
      await expenseService.create(data);
    }
    dialogVisible.value = false;
    await fetchExpenses();
    await fetchRealExpenses();
  } finally {
    loading.value = false;
  }
};

export const onDelete = async (id: string) => {
  loading.value = true;
  try {
    await expenseService.delete(id);
    await fetchExpenses();
    await fetchRealExpenses();
  } finally {
    loading.value = false;
  }
};

export const openAddIncome = () => {
  editIncomeId.value = null;
  Object.assign(incomeForm.value, {
    id: '',
    title: '',
    amount: 0,
    date: dayjs(),
    userId: auth.user?.id || '',
    forUserId: selectedUserId.value,
  });
  dialogVisibleIncome.value = true;
};

export const openEditIncome = (row: any) => {
  editIncomeId.value = row.id;
  Object.assign(incomeForm.value, { 
    id: row.id,
    ...row, 
    date: row.date ? dayjs(row.date) : dayjs(),
    userId: auth.user?.id || '',
    forUserId: selectedUserId.value,
  });
  dialogVisibleIncome.value = true;
};

export const onSubmitIncome = async () => {
  loading.value = true;
  try {
    const data = {
      title: incomeForm.value.title,
      amount: Number(String(incomeForm.value.amount).replace(/[^\d]/g, '')),
      date: incomeForm.value.date ? dayjs(incomeForm.value.date).toISOString() : null,
      userId: auth.user?.id || '',
      forUserId: selectedUserId.value,
      ...(editIncomeId.value && { id: editIncomeId.value }),
    };
    if (editIncomeId.value) {
      await api.put(`${API_BASE_URL}/incomes/${editIncomeId.value}`, data);
    } else {
      await api.post(`${API_BASE_URL}/incomes`, data);
    }
    dialogVisibleIncome.value = false;
    await fetchIncome();
    await fetchRealExpenses();
  } finally {
    loading.value = false;
  }
};

export const onDeleteIncome = async (id: string) => {
  loading.value = true;
  try {
    await api.delete(`${API_BASE_URL}/incomes/${id}`);
    await fetchIncome();
    await fetchRealExpenses();
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
  // Sort theo ngày giảm dần để các bản ghi cùng ngày luôn liền nhau
  return data.slice().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

export const totalAmount = computed(() => {
  return filteredExpenses.value.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
});

export const filteredIncome = computed(() => {
  let data = income.value;
  if (filterMonth.value) {
    data = data.filter((e: any) => {
      if (!e.date) return false;
      const m = dayjs(e.date).format('YYYY-MM');
      return m === filterMonth.value.format('YYYY-MM');
    });
  }
  return data;
});

export const totalIncomeAmount = computed(() => {
  return filteredIncome.value.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
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

export const exportExpensesExcel = async () => {
  if (!selectedUserId.value || !filterMonth.value) return;
  try {
    const month = filterMonth.value.month() + 1;
    const year = filterMonth.value.year();
    const url = `/expenses/export-excel/${selectedUserId.value}?month=${month}&year=${year}`;
    const res = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `chi-tieu-thang-${month}-${year}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Lỗi khi export Excel chi tiêu:', error);
  }
};

export const exportIncomeExcel = async () => {
  if (!selectedUserId.value || !filterMonth.value) return;
  try {
    const month = filterMonth.value.month() + 1;
    const year = filterMonth.value.year();
    const url = `/incomes/export-excel/${selectedUserId.value}?month=${month}&year=${year}`;
    const res = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `thu-nhap-thang-${month}-${year}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Lỗi khi export Excel thu nhập:', error);
  }
};
  