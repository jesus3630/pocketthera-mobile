import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://pocketthera-backend-production.up.railway.app';

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const TOKEN_KEY = 'jwt';
