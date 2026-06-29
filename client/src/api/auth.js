import client from './client';

export const register = async ({ name, email, password }) => {
  const { data } = await client.post('/auth/register', { name, email, password });
  return data.data;
};

export const login = async ({ email, password }) => {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data;
};

export const me = async () => {
  const { data } = await client.get('/auth/me');
  return data.data;
};
