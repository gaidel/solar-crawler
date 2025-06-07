# ✅ TODO: Solar Crawler - Iteration 0

This is the development checklist for the first working prototype of Solar Crawler.  
Check off each item as it's completed.

---

## 🧱 Core Infrastructure

- [x] Set up project structure with Phaser 3 and TypeScript
- [x] Create basic game loop and initialize Phaser scene
- [x] Add background with horizontal scrolling
- [x] Load placeholder PNG sprites for player, enemies, bullets

---

## 🚀 Player Mechanics

- [x] Implement vertical movement via `W` / `S` or `Arrow Up` / `Arrow Down`
- [x] Add automatic shooting at fixed intervals
- [x] Create player bullets that move left to right
- [x] Detect collisions between player and enemies or projectiles
- [x] Trigger Game Over on collision

---

## 👾 Enemies

- [x] Create enemy spawner system
- [x] Implement Asteroid (straight movement)
- [ ] Implement Kamikaze (homing movement)
- [ ] Implement Gunner (fires projectiles)
- [ ] Implement Leaper (zigzag/sine movement)
- [x] Handle enemy destruction on bullet hit
- [x] Detect collision between enemies and player

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

---

## 🛠️ Code Quality & Bug Fixes

- [x] Remove debug graphics from production build
- [x] Disable physics debug mode in production
- [ ] Remove console.log statements from production code
- [ ] Add proper error handling
- [ ] Add code comments and documentation

---

## 🎯 Priority Tasks for Next Session

1. **Game States System** - Add proper GameOver and Victory screens
2. **Wave System** - Implement structured waves instead of infinite spawning
3. **Additional Enemy Types** - At least implement Kamikaze enemy
4. **Audio System** - Add basic sound effects
5. **Code Cleanup** - Remove debug console.logs
