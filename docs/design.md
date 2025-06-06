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

## 🎮 Player Mechanics

- **Movement:**  
  The ship stays centered horizontally and can move **up/down** only:
  - `W` / `Arrow Up` = move up  
  - `S` / `Arrow Down` = move down

- **Shooting:**  
  The ship fires bullets automatically at regular intervals (e.g. every 300 ms).  
  Bullets travel **left to right** and are destroyed offscreen or on hit.

- **Collision:**  
  The player is destroyed if:
  - An enemy touches the ship  
  - A **hostile projectile** hits the ship  

---

## 👾 Enemy Types

Each wave contains a mix of enemies from the following types:

### 1. **Asteroid**
- Moves in a straight line from right to left
- No AI, just a moving hazard
- Dies from one hit

### 2. **Kamikaze**
- Moves slowly but **tracks the player’s vertical position**
- Gradually curves toward the player
- Dies from one hit

### 3. **Gunner**
- Moves straight right to left
- Periodically fires bullets **from right to left**
- Can be destroyed before it fires
- Dies from one hit

### 4. **Leaper**
- Moves in a zigzag or sinusoidal pattern
- Harder to hit due to erratic motion
- Dies from one hit

---

## 🧠 Enemy Spawning

- Enemies spawn at regular intervals during each wave (e.g. every 1–2 seconds)
- Waves increase in density or variety
- Each wave lasts approx. 10–15 seconds
- After 8 waves, the player wins

---

## 🧨 Victory & Defeat

- **Victory:** Player survives all 8 waves
- **Defeat:** Triggered if:
  - An enemy touches the player
  - A hostile projectile hits the player

After the game ends, show a simple "You Win!" or "Game Over" screen with restart option.

---

## 🌌 Visual Style

- Use PNG sprites for all entities:
  - Player ship
  - Bullets
  - Enemies (4 types)
  - Background layers (scrolling starfield, solar debris)
- Placeholder art is acceptable, but use sprite images rather than geometric shapes

---

## 🔊 Audio

- **Background music** loop during gameplay  
- **Firing sound** for player shots  
- **Explosion sound** when an enemy is destroyed  
- Audio should be minimal but impactful
