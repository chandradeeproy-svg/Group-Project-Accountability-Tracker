# Frontend Optimization Plan

This document outlines the proposed optimizations for the frontend of the Group Project Accountability Tracker.

## 1. Performance Optimizations

### Route-based Code Splitting
Currently, all pages are imported statically in `App.jsx`, which increases the initial bundle size. Using `React.lazy` and `Suspense` will allow the browser to load only the necessary code for the current route.

- **Action**: Refactor `App.jsx` to use `React.lazy` for all page components.
- **Benefit**: Faster initial page load and reduced "Time to Interactive" (TTI).

### Data Fetching & Caching
The application uses `useEffect` for data fetching, which lacks built-in caching, deduplication, and background updates.

- **Action**: Implement **TanStack Query (React Query)** for all API interactions.
- **Benefit**:
    - Automatic caching of project and task data.
    - Simplified loading/error states.
    - Background refetching to keep data fresh.
    - Drastic reduction in manual `useEffect` and `useState` boilerplate.

### Memoization
Identify expensive calculations and components that re-render unnecessarily.

- **Action**: 
    - Wrap list items and heavy UI components in `React.memo`.
    - Use `useMemo` for derived data (e.g., filtering active tasks in `Dashboard.jsx`).
    - Use `useCallback` for event handlers passed to optimized child components.

## 2. User Experience (UX) Optimizations

### Optimistic Updates
Currently, the UI waits for the API to respond before updating (e.g., marking a task as done).

- **Action**: Use TanStack Query's `onMutate` to update the local state immediately, with a rollback mechanism if the API fails.
- **Benefit**: Interface feels instantaneous and "lag-free".

### Enhanced Loading States
Replace generic "Loading..." text with skeleton screens.

- **Action**: Create `Skeleton` components for Dashboard cards and Task lists.
- **Benefit**: Perceived performance improvement as users see the layout structure before data arrives.

## 3. Code Quality & Maintainability

### Styling System
Move away from inline styles in components like `Dashboard.jsx`.

- **Action**: 
    - Utilize Tailwind CSS more consistently if preferred, or extract inline styles to CSS Modules/Global classes.
    - Standardize spacing and layout utilities in `index.css`.
- **Benefit**: Better bundle optimization (Vite can better purge unused CSS) and easier maintenance.

### Logic Extraction
Extract business logic from components into custom hooks.

- **Action**: Create hooks like `useProjects` or `useTasks` to encapsulate fetching and mutation logic.
- **Benefit**: Cleaner components focused on presentation.

## Next Steps
1. [ ] Install `@tanstack/react-query`.
2. [ ] Refactor `App.jsx` for code splitting.
3. [ ] Implement `useProjects` and `useTasks` hooks.
4. [ ] Standardize styles in `Dashboard.jsx`.
