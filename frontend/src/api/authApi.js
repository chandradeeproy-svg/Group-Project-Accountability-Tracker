import { apiFetch } from "./http.js";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
export function login(email, password) {
    return apiFetch(`${BASE}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}
export function register(name, email, password) {
    return apiFetch(`${BASE}/auth/register`, {
        method: "POST",
        body: JSON.stringify({ name, email, password })
    });
}
// export function getMe(token: string) {
//   return apiFetch(`${BASE}/auth/me`, {}, token);
// }
