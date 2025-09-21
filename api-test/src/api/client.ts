import axios from 'axios';
export const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE || 'http://localhost:4000/auth';
export const COURSE_BASE = process.env.NEXT_PUBLIC_COURSE_BASE || 'http://localhost:4002/courses';
export const RECO_BASE = process.env.NEXT_PUBLIC_RECO_BASE || 'http://localhost:4001/recommendations';
let _token: string = '';
if (typeof window !== 'undefined') { _token = localStorage.getItem('jwt') || ''; }
export function setToken(t?: string){ _token = t || ''; if (typeof window !== 'undefined'){ if(t) localStorage.setItem('jwt', t); else localStorage.removeItem('jwt'); } }
export function getToken(){ return _token; }
export const http = axios.create();
http.interceptors.request.use((config)=>{ const tok = getToken(); if(tok){ config.headers = config.headers || {}; (config.headers as any).Authorization = `Bearer ${tok}`; } return config; });
