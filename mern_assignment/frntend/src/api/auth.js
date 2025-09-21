import { http, AUTH_BASE, setToken } from "./client";

export async function signup(username, password){
  const { data } = await http.post(`${AUTH_BASE}/signup`, { username, password });
  return data;
}
export async function login(username, password){
  const { data } = await http.post(`${AUTH_BASE}/login`, { username, password });
  if (data?.token) setToken(data.token);
  return data;
}
export function logout(){ setToken(""); }
