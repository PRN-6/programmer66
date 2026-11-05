# GEMINI.md - Google Antigravity & Gemini Project Guide

Welcome to **programmer66** — an autonomous agricultural programming game and live competitive coding hackathon platform.

---

## 🛠️ Project Architecture & Tech Stack

- **Frontend Core**: React 19, TypeScript, Vite 8 (Rolldown)
- **3D World Simulation**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **State Management**: Zustand stores with atomic state subscriptions
  - `useGameStore`: Farm tiles, drone robots, simulation tick, missions, inventory, treasury.
  - `useEditorStore`: Monaco editor buffers, scripts, output console.
  - `useCompetitionStore`: Multiplayer hackathon rooms, leaderboard, real-time submissions.
  - `useAuthStore`: Player accounts, Super Admin elevation, local dev fallback, Supabase cloud sync.
- **Code Editor & Scripting**: Monaco Editor with custom custom Python/Pseudocode parser, lexer, AST interpreter, and safety limits.
- **Backend / Realtime**: Supabase (PostgreSQL, Realtime Broadcast/Presence, Row Level Security, Auth) + Local Peer fallback (`BroadcastChannel`).
- **Styling**: Tailwind CSS + Lucide React icons.

---

## ⚡ Essential Development Commands

```bash
# Start local dev server
npm run dev

# Run Vitest test suite
npx vitest run

# Run ultra-fast linter (zero warnings/errors required)
npx oxlint

# Production build check (TypeScript check + Vite bundle)
npm run build
```

---

## 🚀 Performance & 60 FPS Low-Spec Optimization Guidelines

1. **Throttled Simulation**: The simulation runner in `FarmCanvas.tsx` is throttled to ~8-12 Hz via `accumRef`. Never trigger React state updates on every 60/120 FPS animation frame.
2. **Component Isolation**: Expensive 3D scenes (like `<SkyAndFog />`) are extracted from canvas roots so day/night or weather transitions do not re-render the 3D meshes.
3. **Adaptive Rendering**: Use `@react-three/drei`'s `AdaptiveDpr` and `AdaptiveEvents`. Respect `graphicsQuality` (`low` | `balanced` | `high`) from `useGameStore`.
4. **Bundle Splitting**: Keep vendor chunks divided (`vendor-three`, `vendor-monaco`, `vendor-supabase`, `vendor-ui`) in `vite.config.ts`. Modals must remain lazy-loaded via `React.lazy()` and `Suspense`.

---

## 🏆 Competition Mode vs. Sandbox Rules

- **Sandbox Mode**: Normal farming mode with time speed controls (1x, 2x, 5x), weather controls, manual farming toolbar, and missions tracker.
- **Competition Mode**: Activated when joining a room (`currentRoom` is not null). The UI must hide sandbox toolbar controls, lock execution to competition challenges, and display the live event round, timer, and scoreboard.

---

## 🛡️ Super Admin & Authentication Rules

- **Super Admin**: Authenticated using master credentials in `.env` (`VITE_SUPER_ADMIN_EMAIL`, `VITE_SUPER_ADMIN_PASSWORD`, `VITE_SUPER_ADMIN_USERNAME`).
- **Player Progression**: Hybrid model. Allows instant registration and login in development without waiting for email verification, and syncs automatically to Supabase `player_saves` when cloud is active.
- **Single Claim Enforcement**: Mission rewards must strictly check `mission.rewardClaimed` to prevent duplicate money or XP exploits.
