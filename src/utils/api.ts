import axios from 'axios';
import type { User } from '../types';

const api = axios.create({
  baseURL: 'https://reqres.in/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error('Invalid credentials');
  }
};

export const getUsers = async (page: number) => {
  const response = await api.get(`/users?page=${page}`);
  return response.data;
};

export const updateUser = async (id: number, data: Partial<User>) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  await api.delete(`/users/${id}`);
};

export default api;