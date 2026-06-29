import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL,
  timeout: 12000,
});

const TOKEN_KEY = 'forkful_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

client.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Normalize errors so callers always get { message, errors }
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const resp = err.response;
    const data = resp?.data || {};
    const normalized = {
      status: resp?.status || 0,
      message:
        data.message ||
        (err.code === 'ECONNABORTED' ? 'Request timed out' : err.message || 'Network error'),
      errors: data.errors || [],
    };
    return Promise.reject(normalized);
  }
);

// Helper to expose cache headers when present.
export const cacheMeta = (resp) => ({
  source: resp.headers?.['x-cache'] || null,
  ttl: Number(resp.headers?.['x-cache-ttl'] || 0),
  dataSource: resp.headers?.['x-data-source'] || null,
});

export default client;
