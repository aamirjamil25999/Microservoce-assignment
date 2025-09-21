import { http, AUTH_BASE, setToken } from './client';
export async function login(username: string, password: string){
  const { data } = await http.post(`${AUTH_BASE}/login`, { username, password });
  if (data?.token) setToken(data.token);
  return data;
}
