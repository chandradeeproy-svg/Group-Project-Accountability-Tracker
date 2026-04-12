import { apiFetch } from "./http";

const BASE = import.meta.env.VITE_AUTH_API_URL || "http://localhost:4001";

export function searchUsers(query: string, token: string) {
  return apiFetch(`${BASE}/users/search?q=${query}`, {}, token);
}
