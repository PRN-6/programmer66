# System Architecture & Technical Specifications

**programmer66** is an autonomous agricultural drone simulator, interactive Python runtime engine, and real-time multiplayer coding tournament platform.

```
+---------------------------------------------------------------------------------------+
|                                    React 19 Frontend                                   |
|                                                                                       |
|   +-----------------------+   +------------------------+   +----------------------+   |
|   |    Three.js / R3F     |   |      Monaco Editor     |   |     Zustand Stores   |   |
|   |  - 3D Terrain & Props |   |  - Multi-tab Buffers   |   |  - useGameStore      |   |
|   |  - Drone Kinematics   |   |  - Syntax & Diagnostic |   |  - useEditorStore    |   |
|   |  - Weather & Shadows  |   |  - Floating Window     |   |  - useAuthStore      |   |
|   +-----------------------+   +------------------------+   |  - useCompetitionStore|  |
|                                                            |  - useMaintenanceStore|  |
|                                                            +----------------------+   |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                            Custom Python Execution Engine                             |
|                                                                                       |
|      [ Source Code ] ---> [ Lexer / Tokenizer ] ---> [ AST Parser ] ---> [ Interpreter ]|
|                                                                                |      |
|                                                                                v      |
|                                                                       [ createGameAPI ]|
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                   Cloud / Backend                                     |
|                                                                                       |
|   +------------------------------------+    +-------------------------------------+   |
|   |        Supabase PostgreSQL         |    |      Supabase Realtime WebSockets   |   |
|   |  - rooms & teams                   |    |  - room updates & broadcast presence|   |
|   |  - player_profiles & saves         |    |  - system_maintenance_channel       |   |
|   |  - system_settings                 |    |  - live leaderboard sync            |   |
|   +------------------------------------+    +-------------------------------------+   |
+---------------------------------------------------------------------------------------+
```

---

## 🏛️ Core Technologies & Libraries

- **Frontend Core**: React 19, TypeScript 5, Vite 8 (Rolldown engine).
- **3D World Simulation**: Three.js, `@react-three/fiber`, `@react-three/drei`.
- **Code Editor**: `@monaco-editor/react` with custom IntelliSense autocomplete and Python grammar.
- **State Layer**: Zustand with atomic slice selectors and `useShallow` re-render guards.
- **Backend / Realtime**: Supabase (PostgreSQL 15, Row Level Security, Realtime Broadcast) + local peer fallback (`BroadcastChannel`).
- **Styling**: Tailwind CSS + Lucide React icon set.
- **Linter & Verification**: Oxlint (Rust-based AST linter) and Vitest (52 unit tests).

---

## 🏎️ Performance & 60 FPS Low-Spec Optimizations

1. **Throttled Simulation Runner**:
   - The simulation loop in `FarmCanvas.tsx` is throttled to 8 Hz (~125ms) via an accumulator ref (`accumRef`). State updates never trigger on raw 60/120 FPS animation frames.
2. **Mesh & Scene Component Isolation**:
   - Atmosphere meshes (`<SkyAndFog />`) are extracted from canvas roots so day/night or weather transitions do not re-render heavy 3D terrain meshes.
3. **Adaptive Rendering**:
   - Utilizes `@react-three/drei`'s `AdaptiveDpr` and `AdaptiveEvents`. Respects `graphicsQuality` (`low`, `balanced`, `high`).
4. **Vite Code Splitting**:
   - Bundle split into distinct vendor chunks (`vendor-three`, `vendor-monaco`, `vendor-supabase`, `vendor-ui`).
   - Modals are lazy-loaded via `React.lazy()` and `Suspense`.

---

## 🛡️ Authentication & Authorization Rules

- **Super Admin**: Master credential authentication verified against `.env` variables (`VITE_SUPER_ADMIN_EMAIL`, `VITE_SUPER_ADMIN_PASSWORD`).
- **Player Cloud Saves**: Syncs automatically to Supabase `player_saves` and `player_profiles` when online, with instant local developer session fallback.
- **Row Level Security (RLS)**: Enforced via PostgreSQL policies in `supabase_schema.sql` to protect sensitive cloud data.

