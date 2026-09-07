import axios from 'axios';
import { env } from './env';
import { TOKEN_KEY } from './constants';

/**
 * The one axios instance for the application API.
 *
 * The bearer token is attached here and nowhere else — data providers and
 * feature api modules must not set an Authorization header themselves.
 */
export const httpClient = axios.create({
  baseURL: env.apiUrl,
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
