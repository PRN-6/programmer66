# programmer66 🌾🚁

> **An Autonomous 3D Agricultural Drone Simulator, In-Browser Python Automation Runtime, and Real-Time Multiplayer Coding Tournament Platform.**

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r187-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-52%20Passing-brightgreen?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Oxlint](https://img.shields.io/badge/Oxlint-0%20warnings-blue?logo=rust&logoColor=white)](https://oxc.rs/)

---

## 📖 Overview

**programmer66** combines an interactive 3D agricultural simulation with an educational Python programming environment and a live competitive coding platform.

Players write Python scripts in a floating, multi-tab Monaco code editor to command an aerial quadcopter drone across procedural farmlands. Automate planting, moisture balance, fertilization, weed eradication, and crop harvesting to generate revenue, level up, and complete missions.

Organizers can host **live multiplayer coding tournaments** powered by **Supabase Realtime WebSockets**, featuring room code pairing, custom algorithmic challenges, automated test grading, dynamic field topographies, and live rank podiums.

---

## 📚 Documentation Index

For in-depth technical guides and specifications:

- 🚁 **[Python API Reference](./docs/API_REFERENCE.md)**: Full method signatures for `robot`, `farm`, `tile`, `inventory`, and global speed-coding shortcuts.
- 🏛️ **[System Architecture](./docs/ARCHITECTURE.md)**: 3D scene isolation, 60 FPS performance optimizations, React 19 + Zustand state model, and AST interpreter design.
- 🏆 **[Multiplayer Competitions Guide](./docs/COMPETITIONS_GUIDE.md)**: Hosting tournaments, authoring custom challenges, setting field topographies, and live grading.
- 🛠️ **[Live System Maintenance Guide](./docs/MAINTENANCE_GUIDE.md)**: Site-wide lockdown modes, developer authorization bypass, and global realtime broadcast announcements.

---

## ✨ Features

### 1. 3D Farm World & Atmosphere
- **Three.js & React Three Fiber**: Interactive 3D terrain featuring a rustic farmhouse, classic timber red barn, animated rotating windmill, and freshwater irrigation pond.
- **Dynamic 24-Hour Day/Night Cycle**: Smooth diurnal progression from dawn to starry midnight with volumetric moonlight.
- **Stadium Floodlight Towers**: 4 industrial floodlight pylons casting dynamic shadows and volumetric light cones across the soil beds at night.
- **Weather Simulation**: Dynamic cycles of Sunny, Cloudy, Rainy, Stormy (with lightning flashes), and Drought heatwaves.

### 2. Autonomous Aerial Quadcopter Kinematics
- **Physics Flight Dynamics**: Pitch tilt, roll banking, continuous rotor spinning, smooth cubic waypoint interpolation, and dynamic ground shadows.
- **Visual Drone Effects**:
  - 💧 **Watering**: Hydrating mist spray particles.
  - 🌱 **Planting**: Precision seed drop and soil furrowing.
  - 🌾 **Harvesting**: High-speed cutter blades collecting mature produce.
  - ✨ **Fertilizing**: Golden bio-nutrient particle shower.
  - 🧹 **Weed Clearing**: Rotor downdraft clearing invasive brush.

### 3. Floating In-Browser Python Automation Runtime
- **Custom Scripting Engine**: Fast custom Lexer, Abstract Syntax Tree (AST) Parser, and asynchronous Step-by-Step Interpreter with infinite loop protection.
- **Floating Monaco Editor**: Movable, minimizable, and maximizable code window with syntax highlighting, auto-complete IntelliSense, and line diagnostics.
- **Multi-Tab File System**: Organize code across multiple files (`main.py`, `patrol.py`, `economy.py`).
- **Speed Controls**: Throttled execution at 1x, 2x, 5x, or Instant batch processing.

### 4. Multiplayer Tournament & Hackathon Platform
- **Instant Room Codes**: Generate tournament rooms with 4-digit codes (e.g., `PROG-4921`) and shareable invite links (`?room=PROG-4921`).
- **Live Event Controller**: Admin countdown timer controls (Start, Pause, Resume, Close).
- **Curriculum & Custom Challenges**: Built-in progressive algorithmic levels + custom challenge creator with custom point rewards and starter code.
- **Live Podium Scoreboard**: Instant rank updates showing team podiums (🥇 #1, 🥈 #2, 🥉 #3), solved challenges, and scores.
- **Code Inspector**: Inspect the live Python code submitted by competitor teams.

### 5. World Leaderboard & Player Progression
- **Persistent Cloud Profiles**: Register player accounts with instant cloud save synchronization.
- **Global Rank Tracker**: Dynamically ranks players based on total completed missions, character level, and accumulated XP.
- **Zero Dummy Bots**: Strictly tracks real registered human players.

### 6. Site-Wide System Maintenance & Developer Console
- **Production Gating**: Super Admin controls to toggle **Full Lockdown**, **Read-Only Sandbox**, or **Warning Banner**.
- **Realtime Broadcasts**: Send emergency notifications instantly to all connected visitors worldwide via Supabase Realtime WebSockets.
- **Zero-Migration Fallback**: Automatically persists maintenance configuration via `system_settings` or fallback `rooms` without requiring manual database migrations.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/PRN-6/programmer66.git
cd programmer66
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run Tests & Linter
```bash
npx vitest run   # Runs 52 Vitest unit tests (all 8 test suites)
npx oxlint       # Runs ultra-fast Rust linter (0 warnings, 0 errors)
npm run build    # Production TypeScript & Vite bundle check
```

---

## 🗄️ Supabase Cloud Setup (Multiplayer & Cloud Saves)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run [`supabase_schema.sql`](./supabase_schema.sql).
3. Copy your **Project URL** and **`anon` public key** from Supabase Settings $\rightarrow$ Data API.
4. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key

   # Super Admin Master Credentials
   VITE_SUPER_ADMIN_EMAIL=your_admin_email@example.com
   VITE_SUPER_ADMIN_USERNAME=your_admin_username
   VITE_SUPER_ADMIN_PASSWORD=your_secure_password_here
   ```
5. Restart your dev server (`npm run dev`) or run `npm run build`.

---

## 💻 Python Scripting Quick Reference

```python
# Loop through all farm plots
for tile in farm.get_tiles():
    # If the plot is empty, fly over and plant wheat
    if tile.is_empty():
        robot.move_to(tile.x, tile.y)
        robot.plant("wheat")

    # If the soil needs hydration, spray water
    if tile.needs_water():
        robot.move_to(tile.x, tile.y)
        robot.water()

    # If the crop is ready, harvest it
    if tile.is_ready():
        robot.move_to(tile.x, tile.y)
        robot.harvest()

print("Routine complete.")
```

*See [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) for the complete list of methods and globals.*

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | Component architecture & modern state primitives |
| **Three.js & @react-three/fiber** | 3D farm canvas, lighting, drone physics, volumetric shafts |
| **@monaco-editor/react** | Browser-based Python IDE with custom autocomplete provider |
| **Supabase** | PostgreSQL 15, Row Level Security, Realtime WebSockets |
| **Zustand** | Reactive client-side stores with atomic selector subscriptions |
| **Tailwind CSS v4** | Cyberpunk industrial dark UI styling |
| **Vitest** | Automated test suite (52 tests across 8 suites) |
| **Oxlint** | High-performance Rust-based AST linter |

---

## 📄 License

MIT License. Designed and developed for **programmer66**.
