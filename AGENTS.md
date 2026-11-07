# AGENTS.md - Agent Operating Standards for programmer66

This document defines guidelines, verification steps, and operational constraints for AI coding agents modifying the **programmer66** repository.

---

## 📋 Agent Workflow & Verification Checklist

Before finalizing any task, agents must ensure:
1. **Linter Health**: Run `npx oxlint` and ensure **0 errors and 0 warnings**.
2. **Test Suite Integrity**: Run `npx vitest run` and verify all test suites pass (52 unit tests across 8 test suites).
3. **Build Compilation**: Run `npm run build` to ensure TypeScript compilation and chunk generation succeed without errors.
4. **Git Hygiene**: Keep commits semantic, concise, and focused on the request scope.

---

## 🏛️ Code Conventions & Boundaries

1. **State Subscriptions**: Use atomic selectors with Zustand (`state => state.property`) or `useShallow` to prevent unneeded component re-renders.
2. **Circular Dependencies**: Never create direct circular imports between Zustand stores. Use dynamic imports or callbacks where necessary.
3. **Storage Fallbacks**: All browser storage (`sessionStorage`, `localStorage`) access must be guarded for Node.js / SSR compatibility with memory fallbacks:
   ```ts
   if (typeof window !== 'undefined' && window.localStorage) { ... }
   ```
4. **Supabase Realtime Channels**: Always append a unique instance suffix to channel names (e.g. `channel(`room_${id}_${Date.now()}_${rand}`)`) to prevent fatal `cannot add postgres_changes callbacks after subscribe()` exceptions.
5. **No Hardcoded Passwords**: Never hardcode administrative passwords in application code. Read strictly from environment variables (`import.meta.env.VITE_SUPER_ADMIN_PASSWORD`).
6. **Supabase Safety**: Preserve Row Level Security (RLS) policies defined in `supabase_schema.sql`. Do not bypass access controls.
7. **UI Accessibility & Styling**: Maintain the dark futuristic sci-fi theme (`neutral-900`, `neutral-950`, `amber` for admin, `sky` for player accounts, `emerald` for missions).
