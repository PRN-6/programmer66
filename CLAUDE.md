# CLAUDE.md - Anthropic Claude Project Guide for programmer66

Welcome to **programmer66** — an autonomous agricultural drone simulator, in-browser Python scripting runtime, and real-time multiplayer coding tournament platform.

---

## ⚡ Build, Test & Lint Commands

```bash
# Start local dev server
npm run dev

# Run Vitest test suite (52 tests across 8 suites)
npx vitest run

# Run ultra-fast Rust linter (must maintain 0 errors, 0 warnings)
npx oxlint

# Production TypeScript typecheck + Vite bundle build
npm run build
```

---

## 🏛️ Project Architecture & Key Stores

- **Frontend Core**: React 19, TypeScript, Vite 8 (Rolldown engine), Tailwind CSS v4.
- **3D World Simulation**: Three.js, `@react-three/fiber`, `@react-three/drei`.
- **Zustand State Stores** (`src/store/`):
  - `useGameStore`: Farm plot states, terrain topographies, drone kinematics, simulation ticks, inventory, missions, treasury.
  - `useEditorStore`: Floating multi-tab Monaco editor buffers (`main.py`, `patrol.py`, etc.), console logs, execution speed.
  - `useCompetitionStore`: Tournament rooms, teams roster, live podium scoreboard, challenge evaluation.
  - `useAuthStore`: Player cloud accounts, Super Admin elevation, Supabase auth/sync.
  - `useMaintenanceStore`: Site-wide maintenance policy (`lockdown`, `read_only`, `banner`), live broadcast announcements.
- **Python Execution Runtime** (`src/scripting/`): Custom Lexer, AST Parser, and async step-by-step Interpreter binding to `createGameAPI`.
- **Backend / Realtime**: Supabase (PostgreSQL 15, RLS, Realtime Broadcast) + local peer fallback (`BroadcastChannel`).

---

## 🚨 Critical Engineering Rules

1. **Verification Gate**: Before completing any task, always verify:
   - `npx oxlint` (0 errors, 0 warnings).
   - `npx vitest run` (all 52 tests pass).
   - `npm run build` (successful compilation).
2. **Supabase Realtime Channel Uniqueness**:
   - Calling `supabase.channel("name")` with an already-subscribed name throws:
     `cannot add postgres_changes callbacks after subscribe()`.
   - ALWAYS generate a unique channel topic per subscription instance:
     `supabase.channel(`channel_${id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`)`.
3. **Throttled Simulation (8 Hz)**:
   - The simulation loop in `FarmCanvas.tsx` is throttled to ~8-12 Hz via `accumRef`. Never dispatch React state updates on every 60/120 FPS animation frame.
4. **No Hardcoded Passwords**:
   - Super Admin credentials must be strictly read from `import.meta.env.VITE_SUPER_ADMIN_PASSWORD`. Never hardcode passwords or bypass fallbacks in production.
5. **Node / SSR Safe Storage**:
   - All browser storage (`localStorage`, `sessionStorage`) access must be guarded for Node.js test compatibility:
     `if (typeof window !== 'undefined' && window.localStorage) { ... }` with in-memory fallbacks.
6. **Zustand Subscriptions**:
   - Use atomic selectors (`state => state.property`) or `useShallow` to prevent unnecessary component re-renders.
7. **UI Styling**:
   - Maintain the dark futuristic sci-fi aesthetic (`neutral-900`, `neutral-950`, `amber` for admin, `sky` for player accounts, `emerald` for missions).

