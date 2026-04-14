import { apiFetch } from "./http";

const BASE = import.meta.env.VITE_AUTH_API_URL || "http://localhost:4001";

export function login(email: string, password: string) {
  return apiFetch(`${BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function register(name: string, email: string, password: string) {
  return apiFetch(`${BASE}/auth/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
}

// export function getMe(token: string) {
//   return apiFetch(`${BASE}/auth/me`, {}, token);
// }
