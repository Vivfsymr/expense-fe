import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/expenses`;

export const expenseService = {
  getAll() {
    return axios.get(API_URL);
  },
  getById(id: string) {
    return axios.get(`${API_URL}/${id}`);
  },
  getByUser(userId: string) {
    return axios.get(`${API_URL}/user/${userId}`);
  },
  getByForUser(forUserId: string) {
    return axios.get(`${API_URL}/for-user/${forUserId}`);
  },
  create(data: any) {
    return axios.post(API_URL, data);
  },
  update(id: string, data: any) {
    return axios.put(`${API_URL}/${id}`, data);
  },
  delete(id: string) {
    return axios.delete(`${API_URL}/${id}`);
  },
}; 