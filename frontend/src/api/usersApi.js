import { apiFetch } from "./http.js";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
export function searchUsers(query, token) {
    return apiFetch(`${BASE}/users/search?q=${query}`, {}, token);
}
