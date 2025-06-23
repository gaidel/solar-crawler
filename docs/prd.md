# 📘 Product Requirements Document (PRD)

## 🪐 Project Name
**Solar Crawler**

## 🎯 Purpose

Solar Crawler is a polished browser game where the player controls a spaceship flying through hostile space.
The game combines classic side-scrolling shooter mechanics with roguelike progression. It is designed to be simple, modular, and highly replayable.

**Status: COMPLETED** - A fully playable game ready for hosting on itch.io and modern browsers.

---

## 👤 Target Audience

- Players who enjoy arcade-style space shooters
- Fans of roguelike mechanics and procedural gameplay
- People looking for short, replayable browser experiences
- Primarily desktop users (mouse + keyboard); mobile support optional

---

## 🎮 Core Gameplay Features (IMPLEMENTED)

### **MVP Features (✅ Completed)**
- The player controls a spaceship that moves **up/down** only
- Background scrolls from right to left; the ship stays visually in place
- Ship fires automatically at a fixed rate
- Enemies enter from the right and move left
- Player destroys enemies to survive and earn points
- After surviving a wave, the player chooses one of several **random upgrades**
- Game ends on death (no lives or continues)

### **Enhanced Features (✅ Implemented)**
- **8 Progressive Waves** with 60-second duration each
- **5 Enemy Types** including massive boss (Mothership)
- **16 Unique Upgrades** with strategic combinations
- **Dynamic Audio System** with boss music transitions
- **Visual Effects** including explosions and particle systems
- **Comprehensive Menu System** with settings and volume controls
- **Health Bar System** with damage feedback
- **Professional Asset Organization** with categorized sprites and audio

---

## ⌨️ Control Design Philosophy: "Three-Key Design"

**Solar Crawler** follows a minimalist control philosophy: **the entire game should be playable using only three keys**.

### 🎯 Core Control Scheme
| Key | Function | Context |
|-----|----------|---------|
| **↑ / W** | Move ship up | During gameplay |
| **↓ / S** | Move ship down | During gameplay |
| **⏎ Enter** | Confirm/Restart | Menus and end screens |
| **⎋ ESC** | Pause/Back | Gameplay and menus |

### 🎮 Additional Menu Controls
| Key | Function | Context |
|-----|----------|---------|
| **W / S** | Navigate menu items | All menu screens |
| **⏎ Enter** | Select/Edit | Menu navigation |
| **⎋ ESC** | Back/Cancel | Menu navigation |

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

## 🔄 Development Status

### ✅ **Completed Phases**
1. **✅ Prototype Phase** - Playable core with basic graphics
2. **✅ Core Loop Implementation** - Movement, shooting, enemies, upgrades, death system
3. **✅ Polish Phase** - Professional UI, visual effects, audio system, game balancing
4. **✅ Final Phase** - Code optimization, professional assets, ready for deployment

### 🎯 **Current Status: PRODUCTION READY**
- All MVP features implemented and polished
- Enhanced features exceed original requirements
- Professional asset organization and code structure
- Comprehensive testing and bug fixes completed
- Ready for itch.io deployment

---

## 🏆 Project Achievements

### **Technical Excellence**
- **Modular Codebase** - Clean separation of concerns with TypeScript
- **Professional Architecture** - Organized file structure and asset management
- **Performance Optimized** - Efficient object pooling and memory management
- **Cross-Browser Compatible** - Tested on modern browsers

### **Game Design Success**
- **Balanced Gameplay** - 16 upgrades with strategic depth
- **Progressive Difficulty** - 8 waves with escalating challenge
- **Polished Experience** - Professional UI, audio, and visual effects
- **High Replayability** - Multiple viable upgrade paths and strategies

### **Development Process**
- **Iterative Polish** - Continuous improvement and bug fixing
- **User Experience Focus** - Intuitive controls and clear feedback
- **Documentation** - Comprehensive technical and design documentation
- **Production Ready** - Fully deployable to itch.io platform

---

## ✍️ Development Notes (Archived)

**Original AI Tool Guidelines (Completed):**
- ✅ Keep code modular and readable
- ✅ Prioritize simplicity over premature optimization
- ✅ Use named constants and comments where appropriate
- ✅ Avoid frameworks other than Phaser
- ✅ Focus on **functionality first**, polish iteratively applied
