# Game Design Document: Solar Crawler

## 🧭 Core Concept

An alien species unknown to the galaxy has annihilated the fleet of the Galactic Council. Only one ship remains: a scavenger-class interceptor with automated weapons, trying to escape through collapsing solar zones.

You are the pilot of this last vessel. Survive. Adapt. Crawl through fire.

---

## 🧪 Prototype Scope (Iteration 0)

This document defines the **minimum playable version** of the game, including:
- Scrolling background
- Player ship (moves + shoots)
- Enemies (with behavior types)
- Bullet collisions
- Wave-based progression
- Win/loss conditions
- Basic audio and sprites

---

## �� Player Mechanics

### **Movement**
The ship stays centered horizontally and can move **up/down** only:
- `W` / `Arrow Up` = move up  
- `S` / `Arrow Down` = move down

### **Shooting**
The ship fires bullets automatically at regular intervals (every 300ms).  
Bullets travel **from left to right** (from player toward enemies) and are destroyed offscreen or on hit.

### **Health System**
- **Starting HP**: 100 health points
- **Health Bar**: Visual HP bar in top-left HUD with color coding
  - Green (60%+ HP), Orange (30-60% HP), Red (<30% HP)
- **Damage Flash**: Red tint effect when taking damage
- **Health Persistence**: HP carries over between waves (no healing)

### **Damage System**
Different enemies deal different damage amounts:
- **Enemy Bullets**: 30 damage
- **Kamikaze/Gunner Collision**: 50 damage  
- **Leaper Collision**: 80 damage
- **Asteroid Collision**: 100 damage (instant kill if at full HP)

### **Death Condition**
Player is destroyed only when HP reaches 0, allowing for strategic damage management.

### **Upgrade System**
Between waves, players can select from a pool of powerful upgrades to customize their build:

**Available Upgrades (16 total):**
1. **Damage Boost** - Increase bullet damage (+8 base damage)
2. **Health Boost** - Double maximum health (100 → 200)  
3. **Rate of Fire** - Double firing speed (600ms → 300ms)
4. **Armor Plating** - Reduce incoming damage by 50%
5. **Auto-Repair** - Regenerate 1 HP every 2 seconds
6. **Energy Siphon** - Restore 1 HP on enemy kill
7. **Acid Bullets** - Apply poison damage (8 HP over time)
8. **Engine Upgrade** - Double movement speed
9. **Phase Shield** - 2 seconds invincibility after taking damage
10. **Interceptor** - Player bullets destroy enemy bullets
11. **Projectile Speed** - Double bullet velocity
12. **Rebirth** - Restart wave instead of game over (one-time use)
13. **Multi-Shot** - Fire additional projectiles simultaneously
14. **AOE Bullets** - Bullets explode on impact (4 HP area damage)
15. **Ghost Mode** - Pass through enemies without collision damage
16. **Healing Burst** - Instant health restoration when near death

**Upgrade Mechanics:**
- Upgrades appear after every wave completion (except the final wave)
- 4 random upgrades offered per selection
- Each upgrade can only be taken once per game
- Upgrades persist across waves until game restart
- Strategic build planning becomes crucial for later waves

---

## 👾 Enemy Types & Varieties

Each enemy type has multiple subtypes with different characteristics:

### 1. **Asteroid**
**Normal Asteroid (70% spawn rate):**
- 0.5x scale, standard speed (-300)
- 40 HP (4 hits to destroy)
- 100 collision damage, 10 score points

**Large Asteroid (30% spawn rate):**
- 1.0x scale, slower speed (-150)  
- 80 HP (8 hits to destroy)
- 200 collision damage, 20 score points

### 2. **Kamikaze**
**Normal Kamikaze (70% spawn rate):**
- 0.5x scale, standard homing speed (180)
- 20 HP (2 hits to destroy)
- 50 collision damage, 20 score points

**Fast Kamikaze (30% spawn rate):**
- 0.25x scale, double homing speed (360)
- 10 HP (1 hit to destroy)
- 25 collision damage, 15 score points
- Visual indicator: Red tint

### 3. **Gunner**
**Normal Gunner (70% spawn rate):**
- 0.6x scale, standard speed (-180)
- 20 HP (2 hits to destroy)
- 50 collision damage, 15 score points
- Standard bullet size (0.15x scale)

**Large Gunner (30% spawn rate):**
- 1.2x scale, slower speed (-90)
- 40 HP (4 hits to destroy)  
- 100 collision damage, 30 score points
- Larger bullets (0.3x scale)

### 4. **Leaper**
**Normal Leaper (40% spawn rate):**
- Standard zigzag pattern (150 amplitude, 0.002 frequency)
- 40 HP (4 hits to destroy)
- 80 collision damage, 25 score points

**Wide Leaper (30% spawn rate):**
- Wide zigzag pattern (300 amplitude, same frequency)
- Same stats as normal, but covers 2x vertical space

**Slow Leaper (30% spawn rate):**
- Slow zigzag pattern (150 amplitude, 0.001 frequency)
- Same stats as normal, but longer wave periods

### 5. **Mothership (Boss)**
**Final Boss for Wave 8:**
- **Massive Size**: 669x471 sprite scaled to 80% of screen height
- **High HP**: 5000 HP (requires ~80 seconds of max DPS to defeat)
- **Epic Entrance**: 2-second dissolve effect when spawning
- **Strategic Movement**: Moves from center-right to final position off-screen
- **Offensive Capability**: Fires bullets every 1.5 seconds at player
- **Boss Immunity**: **Immune to acid bullet effects** - no poison damage or green tint
- **Epic Death**: Multiple staggered explosions on defeat
- **Victory Condition**: Wave 8 ends only when boss is defeated (no timer)

---

## 🌊 Wave Progression System

### **Wave Structure**
- **8 Total Waves** with 60-second duration each
- **Progressive Enemy Introduction** for learning curve
- **HP Persistence** between waves (no healing)
- **Escalating Difficulty** with increased spawn frequency in later waves
- **Upgrade Selection** after each wave completion (except final wave)

### **Enemy Availability by Wave**
- **Wave 1**: Asteroids only (learning basic mechanics)
- **Wave 2**: Asteroids + Leapers (unpredictable movement)
- **Wave 3**: Asteroids + Leapers + Kamikazes (homing threats)
- **Wave 4**: All enemy types (full chaos with Gunner bullets)
- **Wave 5**: All enemy types with +10% spawn frequency
- **Wave 6**: All enemy types with +20% spawn frequency
- **Wave 7**: All enemy types with +50% spawn frequency
- **Wave 8**: All enemy types with +50% spawn frequency + **Mothership Boss** (final challenge)

### **Wave Transitions**
- **Wave Completion**: "WAVE X CLEARED!" screen with continue/menu options
- **Upgrade Selection**: Choose from 4 random upgrades after each wave (except final)
- **Final Victory**: "ALL WAVES CLEARED! COMPLETE VICTORY!" after wave 8
- **Rebirth System**: Players with Rebirth upgrade restart current wave instead of game over
- **Seamless Progression**: Player position resets, HP preserved, enemies cleared

---

## 🧠 Enemy Spawning

- **Spawn Intervals**: Different for each enemy type (1-5 seconds)
- **Weighted Selection**: Each enemy subtype has spawn probability
- **Wave-Based Activation**: Enemy types unlock progressively
- **Continuous Spawning**: Enemies spawn throughout wave duration

---

## 🧨 Victory & Defeat

### **Victory Conditions**
- **Wave Victory**: Survive 60 seconds of current wave
- **Final Victory**: Complete all 8 waves successfully
- **Progression**: Score and HP carry over between waves

### **Defeat Condition**
- **HP Depletion**: Game Over only when player HP reaches 0
- **Strategic Gameplay**: Players must manage HP across all waves

### **End Screens**
- **Wave Cleared**: Continue to next wave or return to menu
- **Final Victory**: Restart game or return to menu  
- **Game Over**: Restart game or return to menu

---

## 🌌 Visual Style

- Use PNG sprites for all entities:
  - Player ship
  - Bullets (player and enemy)
  - Enemies (4 types with visual variety indicators)
  - Background layers (scrolling starfield, solar debris)
- **Health Bars**: Dynamic health bars appear below damaged enemies
- **Visual Indicators**: Different enemy subtypes have visual cues (size, tint)

---

## 🔊 Audio

### **Background Music**
- **Menu Music**: Looping track for menu system (`menu.mp3`)
- **Game Music**: Looping ambient track during gameplay (`space-ambient-cinematic-music-345394.mp3`)
- **Boss Music**: Epic battle music for Wave 8 boss fight (`epic-inspiring-battle-361552.mp3`)
- **Dynamic Transitions**: Music switches automatically based on game state
- **Continuous Playback**: Music continues during wave transitions

### **Sound Effects**
- **Player Shooting**: Shot sound for player bullets
- **Enemy Shooting**: Shot sound for enemy bullets (Gunners)
- **Hit Sounds**: Different volume levels for hits vs destruction
- **Explosion Sounds**: Full volume for enemy destruction, reduced for hits
- **Player Damage**: Hit sound when player takes damage

### **Volume System**
- **Three-Level Control**: Master, Music, Sound Effects
- **Persistent Settings**: Volume preferences saved locally
- **Real-Time Adjustment**: Audio preview during volume changes

---

## 🎆 Visual Effects

### **Explosion Effects**
- **Animated explosion sprites** appear when enemies are destroyed
- **Particle systems** with orange-red particles that spread outward
- **Scale animation**: Explosions start small and grow larger before fading
- **Size Variety**: 
  - Small (normal asteroids, fast kamikazes)
  - Medium (large asteroids, normal kamikazes, gunners)
  - Large (all leapers, player death)
- **Additive blending**: Creates realistic glow and fire effects
- **Synchronized timing**: Visual effects match audio explosion sounds

### **Health Bar System**
- **Dynamic Display**: Health bars appear below enemies when damaged
- **Color Coding**: Green (60%+), Orange (30-60%), Red (<30%)
- **Auto-Hide**: Health bars hidden when enemy at full HP
- **Position Tracking**: Health bars follow enemy movement

### **Damage Feedback**
- **Enemy Damage**: Yellow flash (100ms) when enemies take damage
- **Player Damage**: Red flash (200ms) when player takes damage
- **Visual Tinting**: Fast kamikazes have red tint indicator

### **Effect Specifications**
- **Duration**: 400ms for sprite animation, 500ms for particles
- **Colors**: Orange-red gradient (from #ff3300 to #ffcc00)
- **Behavior**: Particles rotate and spread in all directions
- **Performance**: Single particle emitter reused for all explosions
- **Cleanup**: Automatic memory management and sprite disposal

### **Upgrade Visual Effects**
- **Acid Bullets**: Enemies glow green when poisoned, effect stacks with multiple hits
- **Phase Shield**: Player flickers between visible/transparent during invincibility
- **Auto-Repair**: Subtle HP regeneration without visual indicators
- **Energy Siphon**: Instant HP restoration on enemy kill
- **Interceptor**: Small explosions when player bullets destroy enemy bullets

---

## 🎛️ User Interface & Menus

### **Main Menu System**
- **Main Menu**: Start Game, Settings, About, Controls, Credits
- **Navigation**: W/S + Enter for keyboard-only operation
- **Settings Menu**: Volume controls for Master, Music, and Sound Effects
- **Consistent visual design** across all menu screens

### **In-Game HUD**
- **Wave Progress**: "Wave: X/8" display
- **Score Display**: Current score with wave progression
- **Timer**: Countdown showing time remaining in current wave
- **Health Status**: Visual HP bar with embedded HP text (e.g., "75/100")
- **Layout**: HP elements on left, Score/Wave/Time on right

### **Pause System**
- **Activation**: Enter/ESC to pause game during gameplay
- **Pause Menu**: Resume, Settings, Return to Menu options
- **Settings Access**: Volume controls accessible during gameplay
- **Exit Confirmation**: Warning about progress loss

### **Volume Settings**
- **Three-level control**: Master Volume, Background Music, Sound Effects
- **Persistent settings**: Preferences saved to browser localStorage
- **Real-time feedback**: Audio preview while adjusting volumes
- **Intuitive navigation**: W/S to navigate, Enter to edit, ESC to cancel

### **Wave Transition Screens**
- **Wave Victory**: "WAVE X CLEARED!" with continue/menu options
- **Final Victory**: "ALL WAVES CLEARED! COMPLETE VICTORY!"
- **Physics Pause**: Game world pauses during transition screens
- **Music Continuity**: Background music continues playing

### **Visual Feedback**
- **Selected items**: Green text, increased size
- **Editing mode**: Yellow text with brackets `> Volume: 65% <`
- **Consistent styling**: Matches game's overall aesthetic
- **HP Color Coding**: Green/Orange/Red based on health percentage

---

## ⚖️ Game Balance & Recent Changes

### **Upgrade Balance Philosophy**
The upgrade system has been carefully balanced to prevent overpowered combinations while maintaining strategic depth:

**Design Principles:**
- **No Exponential Scaling**: Upgrades use additive bonuses instead of multiplicative
- **Fixed Damage Values**: Special bullet types deal consistent damage regardless of other upgrades
- **Strategic Timing**: Defensive upgrades require tactical activation
- **Build Diversity**: Multiple viable upgrade paths for different playstyles

### **Recent Balance Adjustments**
Several upgrades were rebalanced for fairer gameplay:

**Damage System Changes:**
- **Damage Boost**: Changed from ×2 multiplier to +8 additive bonus
- **Acid Bullets**: Fixed 8 HP poison damage (doesn't scale with damage upgrades)
- **AOE Bullets**: Fixed 4 HP area damage (50% of base damage, not current)

**Defensive System Changes:**
- **Phase Shield**: Reduced from 4 seconds to 2 seconds invincibility
- **Auto-Repair**: Reduced from 1 HP/second to 1 HP/2 seconds
- **Energy Siphon**: Changed from 10% enemy max HP to fixed 1 HP per kill

**Impact on Gameplay:**
- **Early Game**: Upgrades provide meaningful but not overwhelming advantages
- **Mid Game**: Players must choose between offense, defense, and utility
- **Late Game**: Boss remains challenging even with multiple upgrades
- **Replayability**: Different upgrade combinations create varied experiences

### **Player Experience Improvements**

**Movement System:**
- **Smooth Boundaries**: Eliminated "shaking" at screen edges
- **Precise Control**: Boundary-aware movement prevents oscillation
- **Visual Clarity**: Adjusted movement limits to avoid UI overlap

**Collision System:**
- **Ultra-Precise Detection**: Player ship uses 55% × 55% rectangular collision
- **Fair Hit Detection**: Gunner enemies use optimized rectangular collision
- **Visual Accuracy**: Collision boxes match sprite shapes for fairness
- **Configurable Parameters**: Easy adjustment via constants for fine-tuning

**Menu System:**
- **Intuitive Navigation**: Pre-selected menu items for faster interaction
- **Settings Accessibility**: Volume controls available from main menu and pause
- **Anti-Sticky Keys**: Protection against accidental menu exits
- **Consistent Design**: Unified visual style across all interfaces
