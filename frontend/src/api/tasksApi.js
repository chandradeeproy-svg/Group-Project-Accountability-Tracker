import { apiFetch } from "./http.js";
const BASE = import.meta.env.VITE_TASK_API_URL || "http://localhost:4003";
export function getTasksByProject(projectId, token) {
    return apiFetch(`${BASE}/projects/${projectId}/tasks`, {}, token);
}
export function getProjectActivity(projectId, token) {
    return apiFetch(`${BASE}/projects/${projectId}/activity`, {}, token);
}
export function getAllActivity(token) {
    return apiFetch(`${BASE}/activity`, {}, token);
}
export function getMyTasks(token) {
    return apiFetch(`${BASE}/tasks/mine`, {}, token);
}
export function createTask(projectId, title, deadline, token, ownerId) {
    return apiFetch(`${BASE}/tasks`, {
        method: "POST",
        body: JSON.stringify({ projectId, title, deadline, ownerId })
    }, token);
}
export function updateTaskStatus(taskId, status, token) {
    return apiFetch(`${BASE}/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
    }, token);
}
export function approveTask(taskId, token) {
    return apiFetch(`${BASE}/tasks/${taskId}/approve`, { method: "PATCH" }, token);
}
