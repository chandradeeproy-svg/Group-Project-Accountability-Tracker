import { apiFetch } from "./http.js";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
export function getProjects(token) {
    return apiFetch(`${BASE}/projects`, {}, token);
}
export function createProject(name, token) {
    return apiFetch(`${BASE}/projects`, {
        method: "POST",
        body: JSON.stringify({ name })
    }, token);
}
export function addProjectMember(projectId, userId, role, token) {
    return apiFetch(`${BASE}/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId, role })
    }, token);
}
export function getProjectMembers(projectId, token) {
    return apiFetch(`${BASE}/projects/${projectId}/members`, {}, token);
}
export function getProjectById(projectId, token) {
    return apiFetch(`${BASE}/projects/${projectId}`, {}, token);
}
