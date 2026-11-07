# Multiplayer Competitions & Tournament Guide

**programmer66** features a built-in real-time hackathon and multiplayer coding tournament system powered by **Supabase Realtime**.

---

## 🏆 Organizing an Event (Host / Admin)

### 1. Accessing the Organizer Console
- Log in with Super Admin master credentials or click **Organizer Console** in the top HUD menu.
- Open the **Competition Admin Dashboard**.

### 2. Creating a Tournament Room
1. Enter a **Tournament Title** (e.g. `Winter Drone Championship 2026`).
2. Set the **Round Duration** (in minutes).
3. Select an **Agricultural Topography Preset**:
   - `Standard 6x6`: Balanced 36-plot temperate terrain.
   - `Master Tournament 8x8`: Expansive 64-plot landscape for advanced loop routines.
   - `Compact Sprint 4x4`: 16-plot arena for rapid 1v1 speed coding.
   - `Dual Terraces & Canal`: Two fertile strips separated by an irrigation canal.
   - `Island Archipelago`: Disconnected island clusters testing obstacle navigation.
4. Select the **Challenge Curriculum**:
   - Choose from pre-made algorithmic challenges or click **+ Add Challenge** to author a custom problem with custom time limits, target harvest criteria, points, and starter code templates.
5. Click **Create Tournament Room**.

### 3. Room Codes & Invite Links
- Each room is assigned an instant 4-digit code (e.g., `PROG-7821`).
- Share the link directly with competitors: `https://your-domain.com/?room=PROG-7821`.

### 4. Live Event Controls
- **Start Event**: Transitions the room from `waiting` to `active`. Plays fanfare and confetti on all competitors' screens and automatically opens their code editor.
- **Pause / Resume**: Temporarily freezes the countdown timer and code execution.
- **Inspect Code**: Click any team in the teams roster to view their live submitted Python solution in a read-only Monaco modal.
- **Kick Team**: Remove disruptive or disconnected teams from the event in real time.
- **Close Event**: Ends the tournament and locks the final podium scoreboard.

---

## 👩‍💻 Participating as a Competitor

1. Click **Join Event** in the top bar.
2. Enter the **4-Digit Room Code** and your **Team / Handle Name**.
3. You will enter the **Waiting Lobby**, which live-syncs other teams joining the room.
4. Once the host starts the event:
   - Your code editor opens automatically with the active challenge banner.
   - Click **Load Starter** to insert the recommended code template into your editor.
   - Write your Python script and click **Run Script** to verify in real time on the 3D farm canvas.
   - Click **Submit Solution** to submit your code for automated grading and earn points on the live scoreboard.

