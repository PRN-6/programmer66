# GEMINI.md - Google Antigravity & Gemini Project Guide

Welcome to **programmer66** — an autonomous agricultural programming game, procedural 3D drone simulator, and live competitive coding hackathon platform.

---

## 🛠️ Project Architecture & Tech Stack

- **Frontend Core**: React 19, TypeScript, Vite 8 (Rolldown bundler)
- **3D World Simulation**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **State Management**: Zustand stores with atomic state subscriptions
  - `useGameStore`: Farm tiles, procedural topographies, drone robots, simulation tick, missions, inventory, treasury.
  - `useEditorStore`: Floating multi-tab Monaco editor buffers, scripts, output console.
  - `useCompetitionStore`: Multiplayer hackathon rooms, scoreboard, real-time submissions, field presets.
  - `useAuthStore`: Player accounts, Super Admin elevation, local dev fallback, Supabase cloud sync.
  - `useMaintenanceStore`: Site-wide maintenance policy (`lockdown`, `read_only`, `banner`), live broadcast announcements.
- **Code Editor & Scripting**: Monaco Editor with custom Python parser, lexer, AST interpreter, and safety limits.
- **Backend / Realtime**: Supabase (PostgreSQL 15, Realtime Broadcast/Presence, Row Level Security, Auth) + Local Peer fallback (`BroadcastChannel`).
- **Styling**: Tailwind CSS + Lucide React icons.

---

## ⚡ Essential Development Commands

```bash
# Start local dev server
npm run dev

# Run Vitest test suite (all 52 unit tests across 8 suites)
npx vitest run

# Run ultra-fast linter (zero warnings/errors required)
npx oxlint

# Production build check (TypeScript check + Vite bundle)
npm run build
```

---

## 🚀 Performance & 60 FPS Low-Spec Optimization Guidelines

1. **Throttled Simulation**: The simulation runner in `FarmCanvas.tsx` is throttled to ~8 Hz (~125ms) via `accumRef`. Never trigger React state updates on raw 60/120 FPS animation frames.
2. **Component Isolation**: Expensive 3D atmospheric scenes (like `<SkyAndFog />`) are extracted from canvas roots so day/night or weather transitions do not re-render heavy terrain meshes.
3. **Adaptive Rendering**: Use `@react-three/drei`'s `AdaptiveDpr` and `AdaptiveEvents`. Respect `graphicsQuality` (`low` | `balanced` | `high`) from `useGameStore`.
4. **Bundle Splitting**: Keep vendor chunks divided (`vendor-three`, `vendor-monaco`, `vendor-supabase`, `vendor-ui`) in `vite.config.ts`. Modals must remain lazy-loaded via `React.lazy()` and `Suspense`.

---

## 📡 Supabase Realtime & Subscription Rules

1. **Unique Channel Topics**: When calling `supabase.channel(...)`, ALWAYS append a unique instance suffix (e.g. `room_${roomId}_${Date.now()}_${rand}`). Reusing an existing subscribed channel name throws a fatal uncaught error: `cannot add postgres_changes callbacks after subscribe()`.
2. **Error Boundary Wrapping**: The application root is wrapped in `<ErrorBoundary>`. Any component lifecycle or render faults must be caught gracefully with a recovery screen.
3. **Dual-Tier Zero-Migration Fallback**: System maintenance persistence attempts `system_settings` first, and automatically falls back to `rooms.__system_maintenance__` if the dedicated table is not present.

---

## 🏆 Competition Mode vs. Sandbox Rules

- **Sandbox Mode**: Normal farming mode with time speed controls (1x, 2x, 5x), weather controls, manual farming toolbar, and missions tracker.
- **Competition Mode**: Activated when joining a room (`currentRoom` is not null). The UI hides sandbox toolbar controls, locks execution to tournament challenges, and displays the live event round, timer, and scoreboard.
- **Topography Synchronization**: Custom field presets selected by the host are serialized across the room and automatically clamp drone coordinates and tile selections within the new bounds.

---

## 🛡️ Super Admin & Authentication Rules

- **Strict Environment Variables**: Super Admin master credentials are read from `.env` (`VITE_SUPER_ADMIN_EMAIL`, `VITE_SUPER_ADMIN_PASSWORD`, `VITE_SUPER_ADMIN_USERNAME`). Never hardcode fallback passwords in production code.
- **World Leaderboard**: Player ranks are dynamically computed from completed missions, character level, and XP. Real registered human accounts only (no dummy users).
- **Single Claim Enforcement**: Mission rewards strictly verify `mission.rewardClaimed` to prevent duplicate money or XP exploits.
