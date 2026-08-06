import axios from 'axios';
import { getItem } from './storage';

// EXPO_PUBLIC_API_URL lets a dev build point at the deployed API (e.g. when port
// 3000 is taken locally). Production builds always use the Railway URL.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (__DEV__ ? 'http://localhost:3000' : 'https://pocketthera-production.up.railway.app');

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const TOKEN_KEY = 'jwt';
