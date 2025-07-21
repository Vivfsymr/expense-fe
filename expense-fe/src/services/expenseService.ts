import api from './api';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/expenses`;

export const expenseService = {
  async getAll() {
    const res = await api.get(API_URL);
    return res.data.data;
  },
  async getById(id: string) {
    const res = await api.get(`${API_URL}/${id}`);
    return res.data.data;
  },
  async getByUser(userId: string) {
    const res = await api.get(`${API_URL}/user/${userId}`);
    return res.data.data;
  },
  async getByForUser(forUserId: string) {
    const res = await api.get(`${API_URL}/for-user/${forUserId}`);
    return res.data.data;
  },
  async create(data: any) {
    const res = await api.post(API_URL, data);
    return res.data;
  },
  async update(id: string, data: any) {
    const res = await api.put(`${API_URL}/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`${API_URL}/${id}`);
    return res.data;
  },
}; 