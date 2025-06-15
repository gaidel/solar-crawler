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

---

## 🌊 Wave Progression System

### **Wave Structure**
- **8 Total Waves** with 30-second duration each
- **Progressive Enemy Introduction** for learning curve
- **HP Persistence** between waves (no healing)

### **Enemy Availability by Wave**
- **Wave 1**: Asteroids only (learning basic mechanics)
- **Wave 2**: Asteroids + Leapers (unpredictable movement)
- **Wave 3**: Asteroids + Leapers + Kamikazes (homing threats)
- **Wave 4-8**: All enemy types (full chaos with Gunner bullets)

### **Wave Transitions**
- **Wave Completion**: "WAVE X CLEARED!" screen with continue/menu options
- **Final Victory**: "ALL WAVES CLEARED! COMPLETE VICTORY!" after wave 8
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
- **Wave Victory**: Survive 30 seconds of current wave
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
- **Menu Music**: Looping track for menu system
- **Game Music**: Looping ambient track during gameplay
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
