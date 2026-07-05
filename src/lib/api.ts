import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

export const getBasicAuthHeader = (username: string, password: string) => ({
  Authorization: `Basic ${btoa(`${username}:${password}`)}`,
});
