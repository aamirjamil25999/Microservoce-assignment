// Auto-injected adapter by fixer (2025-09-20T21:47:39.729538Z)
import axios from "axios";

export const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE || "${AUTH_BASE}";
export const COURSE_BASE = process.env.NEXT_PUBLIC_COURSE_BASE || "${COURSE_BASE}";
export const RECO_BASE = process.env.NEXT_PUBLIC_RECO_BASE || "${RECO_BASE}";

let _token = (typeof window !== 'undefined' && window.localStorage) ? localStorage.getItem("jwt") || "" : "";

export function setToken(t) {
  _token = t || "";
  if (typeof window !== 'undefined' && window.localStorage) {
    if (t) localStorage.setItem("jwt", t);
    else localStorage.removeItem("jwt");
  }
}

export function getToken() { return _token; }

export const http = axios.create();

http.interceptors.request.use((config) => {
  const tok = getToken();
  if (tok) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${tok}`;
  }
  return config;
});
