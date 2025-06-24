# 🏗️ Project Architecture & File Structure

## 📁 Current Project Structure

```
solar-crawler/
├── 📄 index.html              # Entry point HTML file
├── 📁 assets/                # All game resources (organized by type)
│   ├── 📁 audio/            # Audio assets organized by category
│   │   ├── 📁 bgm/          # Background music
│   │   │   ├── 🎵 menu.mp3
│   │   │   ├── 🎵 space-ambient-cinematic-music-345394.mp3
│   │   │   └── 🎵 epic-inspiring-battle-361552.mp3
│   │   └── 📁 sfx/          # Sound effects
│   │       ├── 🎵 shot.mp3
│   │       └── 🎵 explosion.mp3
│   └── 📁 images/           # Visual assets organized by function
│       ├── 🖼️ background.png
│       ├── 🖼️ explosion.png
│       ├── 🖼️ player.png
│       ├── 📁 enemies/      # Enemy sprites
│       │   ├── 🖼️ asteroid.png
│       │   ├── 🖼️ gunner.png
│       │   ├── 🖼️ kamikaze.png
│       │   ├── 🖼️ leaper.png
│       │   └── 🖼️ mothership.png
│       ├── 📁 projectiles/  # Bullet sprites
│       │   ├── 🖼️ bullet.png
│       │   └── 🖼️ enemy_bullet.png
│       └── 📁 upgrades/     # Upgrade icons (16 total)
│           ├── 🖼️ upgrade-damage.png
│           ├── 🖼️ upgrade-rate-of-fire.png
│           ├── 🖼️ upgrade-projectile-speed.png
│           ├── 🖼️ upgrade-health.png
│           ├── 🖼️ upgrade-regeneration.png
│           ├── 🖼️ upgrade-vampirism.png
│           ├── 🖼️ upgrade-shield.png
│           ├── 🖼️ upgrade-engine.png
│           ├── 🖼️ upgrade-projectile.png
│           ├── 🖼️ upgrade-acid.png
│           ├── 🖼️ upgrade-aoe.png
│           ├── 🖼️ upgrade-interceptor.png
│           ├── 🖼️ upgrade-ghost.png
│           ├── 🖼️ upgrade-healing.png
│           ├── 🖼️ upgrade-rebirth.png
│           └── 🖼️ upgrade-later.png
├── 📁 docs/                  # Project documentation
│   ├── 📄 prd.md            # Product Requirements Document
│   ├── 📄 design.md         # Game Design Document
│   ├── 📄 todo.md           # Development progress & issues
│   └── 📄 architecture.md   # This file
├── 📁 styles/                # CSS stylesheets
│   └── 📄 main.css          # Main game styles
├── 📁 src/                   # Source code
│   ├── 📄 index.ts          # Main game initialization
│   ├── 📄 Player.ts         # Player class
│   ├── 📄 GameUI.ts         # UI system and input handling
│   ├── 📄 AudioManager.ts   # Audio system and music management
│   ├── 📄 ExplosionManager.ts # Visual explosion effects system
│   ├── 📄 UpgradeManager.ts # Upgrade system and player progression
│   ├── 📁 config/           # Configuration and constants
│   │   └── 📄 constants.ts  # Game constants and helpers
│   ├── 📁 enemies/          # Enemy system
│   │   ├── 📄 Enemy.ts      # Base enemy interface and class
│   │   ├── 📄 Asteroid.ts   # Asteroid enemy implementation
│   │   ├── 📄 Kamikaze.ts   # Kamikaze enemy implementation
│   │   ├── 📄 Gunner.ts     # Gunner enemy implementation
│   │   ├── 📄 Leaper.ts     # Leaper enemy implementation
│   │   └── 📄 EnemyManager.ts # Enemy management system
│   ├── 📁 scenes/           # Phaser scenes
│   │   ├── 📄 MainMenuScene.ts  # Main menu
│   │   ├── 📄 AboutScene.ts     # About screen
│   │   ├── 📄 ControlsScene.ts  # Controls screen
│   │   ├── 📄 CreditsScene.ts   # Credits screen
│   │   └── 📄 GameScene.ts      # Main game scene
│   └── 📁 utils/            # Utility functions
│       └── 📄 CollisionHelpers.ts # Collision utilities
├── 📄 package.json          # Dependencies and scripts
├── 📄 tsconfig.json         # TypeScript configuration
├── 📄 vite.config.ts         # Vite build configuration
└── ⚙️ config files          # Build tools, linting, etc.
```

---

## 🎯 File Organization Principles

### 🧹 **Clean Root Directory**
- **Root level** should contain **only essential files**:
  - Entry points (`index.html`, `index.ts`)
  - Configuration files (`package.json`, `tsconfig.json`, etc.)
  - README and basic documentation
- **No source code files** in root directory

### 📂 **Logical Grouping**
- **`src/`** - All source code goes here
- **`assets/`** - All game resources (images, sounds, fonts)
- **`styles/`** - CSS stylesheets and visual styling
- **`docs/`** - All documentation files
- **`config/`** - Configuration and constants (inside `src/`)

### 🔧 **Modular Structure**
- **Separate concerns** into different directories
- **Related files** should be grouped together
- **Easy to scale** - new features get their own subdirectories

---

## 📋 File Placement Rules

### **DO:**
- [x] Put all TypeScript source files in `src/`
- [x] Put game constants in `src/config/constants.ts`
- [x] Put Phaser scenes in `src/scenes/`
- [x] Put utility functions in `src/utils/`
- [x] Put game classes directly in `src/` (Player.ts, etc.)
- [x] Put all images/sounds in `assets/`
- [x] Put all CSS stylesheets in `styles/`
- [x] Put all documentation in `docs/`

### **DON'T:**
- [ ] Put source code files in root directory
- [ ] Mix configuration with game logic
- [ ] Put assets inside `src/` directory
- [ ] Create deep nested structures without reason
- [ ] Leave magic numbers scattered in code

---



## 🎨 Code Organization Best Practices

### 📦 **Constants & Configuration**
- **All magic numbers** go into `src/config/constants.ts`
- **Group related constants** together (PLAYER_CONFIG, ENEMY_CONFIG, etc.)
- **Use meaningful names** and add comments
- **Helper functions** for dynamic calculations

### 🔗 **Import Organization**
- **Relative imports** within src/ directory
- **Absolute imports** from root (for index.ts)
- **Group imports** logically (external libraries, then internal modules)

### 📝 **File Naming**
- **PascalCase** for classes and components (`GameScene.ts`, `Player.ts`)
- **camelCase** for utilities and helpers (`constants.ts`, `collisionHelpers.ts`)
- **kebab-case** for documentation (`architecture.md`, `game-design.md`)

### 📄 **File Formatting Standards**
- **Always end files with newline** - Every file must end with a single newline character (`\n`)
- **No trailing spaces** - Remove whitespace at end of lines
- **Consistent indentation** - Use spaces (configured in prettier)
- **UTF-8 encoding** - All text files should use UTF-8 encoding

#### 🔧 **Why newline at end of file?**
- **POSIX compliance** - Text files should end with newline per POSIX standard
- **Git compatibility** - Prevents "no newline at end of file" warnings
- **Tool compatibility** - Works correctly with command-line tools (cat, grep, etc.)
- **Editor consistency** - Prevents issues when files are edited across different systems

#### ⚙️ **Automated enforcement:**
- **Prettier** handles most formatting automatically (`npm run format`)
- **ESLint** enforces newline rule with `'eol-last': ['error', 'always']`
- **Use `npm run lint:fix`** to automatically fix formatting issues

---

## 🛠️ Maintenance Guidelines

### 🔄 **When Adding New Features:**
1. **Identify the category** (scene, entity, system, utility)
2. **Create appropriate directory** if needed
3. **Update constants** instead of hardcoding values
4. **Add to documentation** if it's a major feature
5. **Run `npm run format` and `npm run lint:fix`** before committing

### 🧹 **Regular Cleanup:**
- **Remove unused files** and imports
- **Consolidate similar functionality**
- **Update documentation** when structure changes
- **Review and refactor** constants regularly
- **Verify file formatting** with `npm run lint` before releases

### **Pre-commit checklist:**
- [ ] All files end with newline
- [ ] No trailing spaces or inconsistent indentation  
- [ ] No console.log statements in production code (except debug/cheat logging)
- [ ] All imports are organized correctly
- [ ] Constants used instead of magic numbers
- [ ] Documentation updated if needed

---

## 🎭 Rendering Order (Z-Index/Depth)

### 📚 **Rendering Layers (Front to Back)**

The game uses Phaser's `depth` system to control rendering order. Higher depth values render on top of lower values.

**Layer Order (closest to player/top → furthest/bottom):**

| Layer | Depth Range | Objects | Description |
|-------|-------------|---------|-------------|
| **UI Overlays** | 200-203 | Menus, dialogs, confirmations | Always on top, blocks game interaction |
| **HUD Elements** | 100-101 | HP bars, score, wave counter | Game UI that should never be occluded |
| **Explosions** | 40 | Explosion sprites and particles | Visual effects that should be very visible |
| **Player Ship** | 30 | Player sprite and related effects | Player should be clearly visible |
| **Boss Enemies** | 20 | Mothership and other bosses | Major threats, prominent visibility |
| **Regular Enemies** | 10-13 | Asteroids, gunners, kamikazes, leapers | Standard enemy sprites |
| **Projectiles** | 5-6 | Player bullets, enemy bullets | Should render behind characters |
| **Background** | 0 | Scrolling background, environment | Furthest back, foundation layer |

### 🎯 **Implementation Rules**

#### **UI Layer Management:**
- **Menus and overlays**: Use `setScrollFactor(0)` to stay fixed on screen
- **HUD elements**: Always set high depth (800+) and scroll factor 0
- **Temporary UI**: Use containers for easy cleanup

#### **Depth Assignment Guidelines:**
- **Background elements**: depth 0
- **Projectiles**: depth 5-6 (behind characters)
- **Regular enemies**: depth 10-13
- **Boss enemies**: depth 20
- **Player**: depth 30
- **Effects**: depth 40
- **HUD**: depth 100+
- **UI Overlays**: depth 200+

#### **Why This Order Matters:**
- **Player visibility**: Player should never be hidden behind enemies or effects
- **UI clarity**: HUD and menus must always be readable
- **Visual hierarchy**: Important elements (player, bosses) render above less important ones
- **Effect prominence**: Explosions should be clearly visible as feedback

#### **Maintenance Guidelines:**
- **Use constants** for depth values to avoid magic numbers
- **Keep ranges** - don't use exact same depth for different object types
- **Document changes** when adding new object types
- **Test layering** especially when adding new visual elements

---

## 🎯 Benefits of This Structure

- [x] **Easy to navigate** - logical file locations
- [x] **Scalable** - can grow without becoming messy
- [x] **Maintainable** - clear separation of concerns
- [x] **Clear rendering order** - predictable visual hierarchy
- [x] **Collaborative** - new developers can understand quickly
- [x] **Professional** - industry-standard organization

---

## 🎵 Audio System Architecture

### **AudioManager.ts** - Centralized Audio Management
The `AudioManager` class provides centralized management of all game audio:

**Features:**
- **Background Music Management** - Menu and game music with looping
- **Multi-Level Volume Control** - Master, Music, and Sound Effects volume settings
- **Persistent Settings** - Volume preferences saved to localStorage
- **Real-time Audio Processing** - Effective volume = Master × Category × Base Volume
- **Sound Effects System** - Shot and explosion sounds with proper cleanup
- **Cleanup & Memory Management** - Proper disposal of audio resources
- **Error Handling** - Graceful fallback when audio fails
- **Autoplay Policy Handling** - Progressive retry system for blocked autoplay

**Volume System:**
- **Three-level control**: Master, Music, Sound Effects (0.0 to 1.0)
- **Effective volume calculation**: Master × Category × Base Volume
- **Persistent settings**: Saved to localStorage

**Audio Files:**
- **`menu.mp3`** - Looping background music for menu system
- **`space-ambient-cinematic-music-345394.mp3`** - Looping background music for gameplay
- **`shot.mp3`** - Sound effect for player and enemy shooting
- **`explosion.mp3`** - Sound effect for enemy destruction and player death

**Integration:**
- All scenes load audio assets via `AudioManager.preload()`
- MainMenuScene and GameScene play appropriate music automatically  
- GameUI provides volume settings interface accessible from menus and pause
- Volume settings persist across game sessions via localStorage
- Proper cleanup when switching between scenes

### **GameUI Volume Settings Integration**

The volume settings are integrated into the game's UI system:

**Access Points:**
- **Main Menu** → Settings → Volume Settings
- **Game Pause Menu** → Settings → Volume Settings

**Navigation:**
- **W/S** - Navigate between volume categories
- **Enter** - Start editing selected volume level
- **W/S (editing mode)** - Adjust volume ±5%
- **Enter** - Confirm changes
- **ESC** - Cancel editing or return to previous menu

**Visual Feedback:**
- **Normal state**: White text, normal size
- **Selected**: Green text, larger size  
- **Editing**: Yellow text with brackets `> Master Volume: 65% <`
- **Real-time preview**: Sound effects play when adjusting SFX volume

---

## 🎆 Explosion Effects System Architecture

### **ExplosionManager.ts** - Visual Explosion Effects Management
The `ExplosionManager` class provides comprehensive visual explosion effects for the game:

**Features:**
- **Animated Explosion Sprites** - Uses explosion.png asset with scale-up and fade-out animations
- **Particle System Integration** - Orange-red particle effects with Phaser 3 particle emitters
- **Multiple Explosion Sizes** - Different intensities for different enemy types
- **Additive Blending** - Realistic glow effects using ADD blend mode
- **Automatic Cleanup** - Proper memory management and resource disposal
- **Synchronized Effects** - Combines sprite animation with particle effects

**Explosion Types:**
- **Small**: 0.6x scale (asteroids)
- **Medium**: 0.8x scale (kamikazes, gunners)
- **Large**: 1.2x scale (leapers, player death)

**Technical Implementation:**
- **Sprite Animation**: Scale-up and fade-out over 400ms
- **Particle System**: Orange-red particles with 360° spread
- **Performance**: Single particle emitter reused for all explosions

**Assets:**
- **`explosion.png`** - Main explosion sprite texture
- **Programmatic particles** - Generated orange-red circular textures

**Integration:**
- Integrated with EnemyManager for automatic explosion triggering
- Synchronized with AudioManager for combined audio-visual effects
- Proper cleanup in GameScene destroy method
- Performance optimized with single particle emitter reuse

---

## 🐛 Debug & Testing System

### **Debug Cheats** - Development Testing Tools
The game includes a comprehensive cheat system for easier testing and debugging:

**Activation Requirements:**
- Cheats only work when `debug: true` is enabled in Phaser configuration (`index.ts`)
- Automatic detection via `this.physics.world.debugGraphic` presence
- Only active during `GameState.PLAYING` state

**Available Cheats:**
- **V Key**: Skip to 10 seconds remaining in current wave
  - Useful for testing wave transitions and completion screens
  - Console logs the action with wave number
- **H Key**: Restore player health to full (100 HP)
  - Useful for testing damage systems without dying
  - Console logs the health restoration

**Technical Details:**
- **Activation**: Only when `debug: true` in Phaser configuration
- **Detection**: Via `this.physics.world.debugGraphic` presence
- **State**: Only active during `GameState.PLAYING`

**Benefits:**
- **Faster Testing**: No need to play through entire waves to test features
- **Damage Testing**: Test HP system without repeated deaths
- **Wave Testing**: Quickly test wave transitions and victory screens
- **Debug Safety**: Only available in debug builds
- **Development Feedback**: Console logging for all cheat actions

---

## 🎯 Collision System Design

### **Player Collision Optimization**
The player ship uses an optimized rectangular collision body that better matches the elongated spaceship sprite:

**Design Principles:**
- **Very Narrow Width**: 55% of sprite width for extremely tight fit to ship hull
- **Minimal Height**: 55% of sprite height for ultra-precise collision detection
- **Rectangular Shape**: Better suited for ship-like sprites than circular collision
- **Visual Balance**: Collision box shifted 5px down from center for better visual alignment
- **Configurable**: Easily adjustable via `PLAYER_CONFIG` constants

**Technical Implementation:**
- **Collision Size**: 55% width × 55% height of sprite
- **Positioning**: 5px downward offset from center
- **Configuration**: Via `PLAYER_CONFIG` constants

**Benefits:**
- **More Accurate**: Better represents the actual ship shape
- **Fairer Gameplay**: Reduces frustrating "edge hits" on empty sprite areas
- **Maintains Balance**: Still forgiving enough for enjoyable gameplay
- **Easy Tuning**: Constants can be adjusted without code changes

### **Enemy Collision Design**

**Gunner Enemies**: Use optimized rectangular collision bodies that better match their elongated ship-like sprites:
- **Width**: 60% of sprite width for accurate hull detection
- **Height**: 50% of sprite height for ultra-tight collision detection
- **Position**: Shifted 5px right (toward ship front) and 7px down from center for optimal visual balance
- **Shape**: Rectangular collision for maximum accuracy on ship-shaped enemies

**Other Enemies**: Continue to use circular collision bodies for simplicity:
- **Asteroids**: Circular collision (naturally round objects)
- **Kamikazes**: Circular collision (simple, fast-moving threats)
  - **Leapers**: Circular collision (zigzag movement makes rectangular less beneficial)

---

## 🗂️ Asset Organization System

### **Professional Asset Structure**
The project follows industry-standard asset organization with logical separation by function and type:

**Benefits of Current Structure:**
- **Logical Separation**: Audio vs Images, BGM vs SFX, Enemies vs Projectiles vs Upgrades
- **Scalable**: Easy to add new categories without restructuring
- **Professional**: Follows game development best practices
- **Maintainable**: Clear locations for different asset types
- **Build-Friendly**: Optimized for CI/CD and asset bundling

**Asset Categories:**
```
assets/
├── audio/           # All audio assets
│   ├── bgm/        # Background music (looping tracks)
│   └── sfx/        # Sound effects (short clips)
└── images/         # All visual assets
    ├── enemies/    # Enemy sprites (5 types)
    ├── projectiles/ # Bullet sprites (2 types)
    ├── upgrades/   # Upgrade icons (16 total)
    └── [core]/     # Core game sprites (player, background, explosion)
```

**Migration from Flat Structure:**
- **Before**: All 28 assets mixed in single `assets/` directory
- **After**: Organized into 6 logical subdirectories
- **Impact**: Updated 25+ file paths across 10+ source files
- **Result**: Professional structure ready for scaling

---

## 📋 Code Standards

### Language Policy
**English Only**: This project uses English exclusively for all code, comments, documentation, and assets. No other languages are permitted, including in code comments. The game is developed in English with no current localization plans.
