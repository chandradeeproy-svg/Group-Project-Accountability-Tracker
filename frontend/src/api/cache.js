// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
export function getCached(key) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    cache.delete(key);
    return null;
}
export function setCached(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}
export function clearCache() {
    cache.clear();
}
