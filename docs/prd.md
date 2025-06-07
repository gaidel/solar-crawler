# 📘 Product Requirements Document (PRD)

## 🪐 Project Name
**Solar Crawler**

## 🎯 Purpose

Solar Crawler is a small-scale browser game where the player controls a spaceship flying through hostile space.
The game combines classic side-scrolling shooter mechanics with roguelike progression. It is designed to be simple, modular, and replayable.

The goal is to develop a complete, playable prototype that can be hosted on itch.io and run in modern browsers.

---

## 👤 Target Audience

- Players who enjoy arcade-style space shooters
- Fans of roguelike mechanics and procedural gameplay
- People looking for short, replayable browser experiences
- Primarily desktop users (mouse + keyboard); mobile support optional

---

## 🎮 Core Gameplay Features (MVP)

- The player controls a spaceship that moves **up/down** only
- Background scrolls from right to left; the ship stays visually in place
- Ship fires automatically at a fixed rate
- Enemies enter from the right and move left
- Player destroys enemies to survive and earn points
- After surviving a wave, the player chooses one of several **random upgrades**
- Game ends on death (no lives or continues)

---

## ⌨️ Control Design Philosophy: "Three-Key Design"

**Solar Crawler** follows a minimalist control philosophy: **the entire game should be playable using only three keys**.

### 🎯 Core Control Scheme
| Key | Function | Context |
|-----|----------|---------|
| **↑ / W** | Move ship up | During gameplay |
| **↓ / S** | Move ship down | During gameplay |
| **⏎ Enter** | Confirm/Restart | Menus and end screens |

### 🎮 Design Benefits
- **Accessibility** - Simple controls for all players
- **Focus on gameplay** - No complex control schemes to distract from the action
- **Universal compatibility** - Works on any keyboard layout
- **One-handed play** possible - No hand position changes required
- **Instant muscle memory** development

### 🎨 Control Guidelines
- **Mouse is optional** - game must work without mouse
- **Always show key hints** on interactive elements
- **Automatic firing** - no fire button needed
- **Enter is universal confirm** across all contexts

---

## 🧱 Platform and Technology

- **Engine:** Phaser 3 (HTML5)
- **Language:** TypeScript
- **Runtime:** Web browser (no download/install)
- **Host:** itch.io (HTML5 game upload)
- **Assets:** Local sprites and sounds (royalty-free or self-made)

---

## ⛓ Constraints

- No external dependencies outside Phaser unless necessary
- No back-end server (fully client-side)
- All code, assets, and configuration must be easily portable and work from a static file host
- Recommended total project size: **up to 256 MB** (to ensure fast loading on itch.io and remain within hosting limits)

---

## 🔄 Development Priorities

1. Build a playable prototype with placeholder graphics
2. Implement core loop: movement → shooting → enemies → upgrades → death
3. Polish: basic UI, feedback (explosions, sounds), balancing
4. Final: optimization, improved assets, deploy to itch.io

---

## ✍️ Notes for AI Tools

- Keep code modular and readable
- Prioritize simplicity over premature optimization
- Use named constants and comments where appropriate
- Avoid frameworks other than Phaser
- Focus on **functionality first**, polish can be iterative
