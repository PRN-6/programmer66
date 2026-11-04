# programmer66 🌾🚁

> **An Autonomous 3D Agricultural Drone Simulator, Python Automation Engine, and Real-Time Multiplayer Coding Competition Platform.**

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r187-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📖 Overview

**programmer66** is an educational, interactive 3D simulation and hackathon platform. Players command an autonomous quadcopter drone by writing Python code in a built-in browser IDE to plant crops, balance soil moisture, fertilize nutrients, and automate high-yield agricultural harvests.

The platform includes a **Multiplayer Competition System** powered by **Supabase Realtime**, allowing organizers to host live coding hackathons with unique room codes, custom problem levels, automated solution grading, and real-time live scoreboards.

---

## ✨ Features

### 1. 3D Farm World & Atmosphere
- **Three.js & React Three Fiber**: Interactive 3D countryside featuring farmhouse, classic gambrel red barn, rotating windmill, and freshwater pond.
- **Dynamic 24-Hour Day/Night Cycle**: Smooth transitions from sunrise to starry midnight with lunar lighting.
- **Stadium Floodlight Towers**: 4 tall corner pylons equipped with 8-head industrial floodlight banks, casting volumetric light beams and dynamic shadows across the farm grid at night.
- **Weather Simulation**: Dynamic cycles of Sunny, Cloudy, Rainy, Stormy (with lightning flashes), and Drought heatwaves.

### 2. Autonomous Quadcopter Drone Physics
- **Realistic Flight Dynamics**: Pitch tilt, roll banking, continuous rotor blade spinning, and smooth bezier trajectory navigation.
- **Visual Drone Effects**:
  - 💧 **Watering**: Mist spray particles hydrating soil.
  - 🌱 **Planting**: Seed drop and soil mound furrowing.
  - 🌾 **Harvesting**: High-speed cutter blades collecting mature crops.
  - ✨ **Fertilizing**: Golden bio-nutrient particle shower.
  - 🧹 **Weed Clearing**: Rapid rotor downdraft clearing dry brush.

### 3. In-Browser Python Automation Runtime
- **Custom Scripting Engine**: Fast custom Lexer, Abstract Syntax Tree (AST) Parser, and asynchronous Step-by-Step Interpreter.
- **Monaco Editor Integration**: Full syntax highlighting, Monaco IntelliSense autocomplete provider, line error markers, and interactive terminal console.
- **Beginner Quick Snippets**: 1-click template insertion bar for beginners (e.g. `🌱 Plant All`, `💧 Water All`, `🌾 Harvest Ready`).

### 4. Multiplayer Competition & Admin System
- **Room Creation**: Generate rooms with instant 4-digit codes (e.g. `PROG-8492`) and shareable invite URLs (`?room=PROG-8492`).
- **Live Event Controller**: Admin controls to Start, Pause, Reset, and End competition countdown timers.
- **Curriculum & Levels**: 5 built-in progressive algorithmic farming challenges + custom challenge creator:
  - *Level 1: Automated Seed Sower* (+100 pts)
  - *Level 2: Smart Irrigation Engineer* (+150 pts)
  - *Level 3: Bountiful Autumn Harvest* (+250 pts)
  - *Level 4: Soil Nutrition Master* (+300 pts)
  - *Level 5: Grand Championship Speed Run* (+500 pts)
- **Real-Time Scoreboard**: Instant leaderboard updates showing team rank podiums (🥇 #1, 🥈 #2, 🥉 #3), solved challenges, and scores.
- **Teams Manager & Code Inspector**: View registered team rosters and inspect the actual Python code submitted by participants.
- **Dual-Mode Backend**: Seamlessly uses **Supabase Realtime WebSockets** when cloud credentials exist, or graceful **Local Peer Sync** (`BroadcastChannel` & `localStorage`) for zero-setup demo mode.

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
npm test        # Runs 19 Vitest unit tests
npm run lint    # Runs Oxlint (0 warnings, 0 errors)
npm run build   # Production TypeScript & Vite compilation
```

---

## 🗄️ Supabase Realtime Setup (Optional for Cloud Multiplayer)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the entire script in [`supabase_schema.sql`](./supabase_schema.sql).
3. Copy your **Project URL** and **`anon` public key** from Supabase Settings $\rightarrow$ Data API.
4. Create a `.env` file in the root folder:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Restart your dev server (`npm run dev`) or build for production (`npm run build`). The Admin Console will display:  
   `⚡ Supabase Cloud Realtime Connected`.

---

## 📚 Python API Reference

Write Python scripts directly in the built-in editor to automate your drone and farm:

### Drone Navigation & Actions
```python
# Fly the quadcopter to specific coordinates
robot.move_to(x, y)
fly_to(x, y)

# Move 1 step in a cardinal direction
robot.move("right") # "up", "down", "left", "right"

# Perform tool actions at current tile location
robot.plant("carrot") # "wheat", "corn", "carrot", "tomato", "potato"
robot.water()
robot.harvest()
robot.fertilize()
robot.clear_weeds()
```

### Farm & Soil Inspection
```python
# Access all farm plots
tiles = farm.get_tiles()
tile = farm.get_tile(x, y)

# Tile status queries
if tile.is_empty():
    tile.plant("wheat")

if tile.needs_water():
    tile.water()

if tile.is_ready():
    tile.harvest()

# Check environmental conditions
weather = farm.get_weather() # "sunny", "cloudy", "rainy", "stormy", "drought"
balance = farm.get_money()
```

### Storage & Market Economy
```python
# Check warehouse stock
wheat_count = inventory.count("wheat")

# Sell harvested crops for cash revenue
if wheat_count >= 10:
    inventory.sell("wheat", 10)

# Buy seeds directly from script
inventory.buy_seeds("corn", 5)
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | Component architecture & modern state management |
| **Three.js & @react-three/fiber** | 3D farm canvas, lighting, drone physics, volumetric shafts |
| **@monaco-editor/react** | Browser-based Python IDE with custom autocomplete provider |
| **Supabase** | Cloud PostgreSQL database & Realtime WebSockets |
| **Zustand** | Ultra-fast client-side reactive state stores |
| **Tailwind CSS v4** | Cyberpunk industrial dark UI styling |
| **Vitest** | Comprehensive unit testing suite |
| **Oxlint** | High-performance Rust-based JavaScript/TypeScript linter |

---

## 📄 License

MIT License. Designed and developed for **programmer66**.
