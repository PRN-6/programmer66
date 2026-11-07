# programmer66 Python API Reference

Write Python automation scripts directly in the built-in floating code editor to command your drone, cultivate crops, manage soil nutrients, and compete in tournaments.

---

## 🚁 Drone & Robot Control (`robot`)

The `robot` object represents the physical aerial quadcopter drone flying over the farm grid.

### Navigation

```python
# Fly to coordinates (x, y) with smooth waypoint interpolation
robot.move_to(2, 4)

# Relative 1-tile movement
robot.move("up")     # "up", "down", "left", "right"

# Retrieve current drone position as [x, y] or tuple
pos = robot.get_position()
print("Drone is at:", pos.x, pos.y)

# Retrieve current battery energy level (0 - 100%)
energy = robot.get_energy()
```

### Drone Actions (At Current Tile)

```python
# Plant a seed at the drone's current position
robot.plant("wheat") # "wheat", "corn", "carrot", "tomato", "potato"

# Spray hydrating mist onto current tile
robot.water(amount=55)

# Harvest mature crop and deposit into inventory
robot.harvest()

# Apply organic fertilizer (+50% soil nutrients)
robot.fertilize()

# Cut away weeds and brush using drone downwash blades
robot.clear_weeds()

# Solar recharge battery back to 100%
robot.recharge()
```

---

## 🌾 Farm Grid & Environment (`farm`)

The `farm` object provides environmental sensors and plot grid queries.

```python
# Get list of all unlocked soil plot objects
tiles = farm.get_tiles()
print("Total plots:", len(tiles))

# Get specific tile by coordinate (x, y)
tile = farm.get_tile(0, 0)

# Check if plot can be planted
if farm.can_plant(0, 0):
    farm.get_tile(0, 0).plant("carrot")

# Current weather condition
weather = farm.get_weather() # "sunny", "cloudy", "rainy", "stormy", "drought"

# Financial treasury balance ($)
treasury = farm.get_money()

# Current simulation day & time
day = farm.get_day()
time_hour = farm.get_time() # float, e.g. 14.5 = 2:30 PM
```

---

## 🌱 Soil Plot Methods (`tile`)

Each tile returned by `farm.get_tile(x, y)` or `farm.get_tiles()` exposes status helpers and actions:

```python
tile = farm.get_tile(x, y)

# Status queries
if tile.is_empty():
    tile.plant("wheat")

if tile.needs_water():
    tile.water()

if tile.is_ready():
    tile.harvest()

if tile.has_weeds():
    tile.clear_weeds()

# Metrics
moisture = tile.get_moisture()     # 0 to 100%
nutrients = tile.get_nutrients()   # 0 to 100%
crop = tile.get_crop()             # e.g. "wheat", or None
stage = tile.get_stage()           # "empty", "seedling", "growing", "mature"
```

---

## 📦 Inventory & Market (`inventory`)

Manage harvested crops, seed stocks, and trade with the market.

```python
# Check warehouse stock
wheat_seeds = inventory.count("wheat_seed")
harvested_wheat = inventory.count("wheat")

# Sell produce for cash ($)
if inventory.count("wheat") >= 10:
    inventory.sell("wheat", 10)

# Buy seeds directly from code
if inventory.count("carrot_seed") == 0:
    inventory.buy_seeds("carrot", 10)
```

---

## ⚡ Global Fast Shortcuts

Convenience global functions for fast competitive speed-coding:

```python
# Direct dispatch shortcuts
fly_to(x, y)
plant(x, y, "wheat")
water(x, y)
harvest(x, y)
fertilize(x, y)
clear_weeds(x, y)

# Get tile state dictionary: {"crop", "growth", "moisture", "nutrients", "weedLevel"}
data = get_tile(0, 0)
if data and data["moisture"] < 50:
    water(0, 0)

# Script pause
sleep(1.0)
```

---

## 💡 Example Automation Script

```python
# Loop through all arable farm plots
for tile in farm.get_tiles():
    # Move drone and plant if empty
    if tile.is_empty():
        print("Planting carrot at (", tile.x, ",", tile.y, ")")
        robot.move_to(tile.x, tile.y)
        robot.plant("carrot")
    
    # Hydrate if moisture dropped below 50%
    if tile.needs_water():
        robot.move_to(tile.x, tile.y)
        robot.water()
    
    # Harvest mature crops
    if tile.is_ready():
        robot.move_to(tile.x, tile.y)
        robot.harvest()

print("Routine complete.")
```

