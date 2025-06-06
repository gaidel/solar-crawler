# ✅ TODO: Solar Crawler - Iteration 0

This is the development checklist for the first working prototype of Solar Crawler.  
Check off each item as it's completed.

---

## 🧱 Core Infrastructure

- [ ] Set up project structure with Phaser 3 and TypeScript
- [ ] Create basic game loop and initialize Phaser scene
- [ ] Add background with horizontal scrolling
- [ ] Load placeholder PNG sprites for player, enemies, bullets

---

## 🚀 Player Mechanics

- [ ] Implement vertical movement via `W` / `S` or `Arrow Up` / `Arrow Down`
- [ ] Add automatic shooting at fixed intervals
- [ ] Create player bullets that move left to right
- [ ] Detect collisions between player and enemies or projectiles
- [ ] Trigger Game Over on collision

---

## 👾 Enemies

- [ ] Create enemy spawner system
- [ ] Implement Asteroid (straight movement)
- [ ] Implement Kamikaze (homing movement)
- [ ] Implement Gunner (fires projectiles)
- [ ] Implement Leaper (zigzag/sine movement)
- [ ] Handle enemy destruction on bullet hit
- [ ] Detect collision between enemies and player

---

## 💥 Projectiles

- [ ] Add enemy bullet logic for Gunner
- [ ] Detect collision between enemy bullets and player
- [ ] Trigger Game Over on enemy projectile hit

---

## 📊 Waves & Progression

- [ ] Create wave system (timed spawning of enemies)
- [ ] Define 8 waves with increasing variety
- [ ] Track wave count and advance to next wave
- [ ] Trigger Victory screen after surviving all 8 waves

---

## 🔊 Audio & Effects

- [ ] Add background music loop
- [ ] Add firing sound effect
- [ ] Add explosion sound effect on enemy death

---

## 🖼️ UI & Game States

- [ ] Create Game Over screen with restart
- [ ] Create Victory screen after wave 8
- [ ] Add Restart logic
