import { apiFetch } from "./http.js";
const BASE = import.meta.env.VITE_AUTH_API_URL || "http://localhost:4001";
export function searchUsers(query, token) {
    return apiFetch(`${BASE}/users/search?q=${query}`, {}, token);
}
