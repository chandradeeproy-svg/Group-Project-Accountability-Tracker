import { getCached, setCached, clearCache } from "./cache.js";
export async function apiFetch(url, options = {}, token) {
    const method = options.method || "GET";
    const cacheKey = `${method}:${url}`;
    if (method === "GET") {
        const cached = getCached(cacheKey);
        if (cached) {
            return cached;
        }
    }
    else {
        // Clear cache on mutations
        clearCache();
    }
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }
    const data = await res.json();
    if (method === "GET") {
        setCached(cacheKey, data);
    }
    return data;
}
