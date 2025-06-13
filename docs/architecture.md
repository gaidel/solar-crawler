# 🏗️ Project Architecture & File Structure

## 📁 Current Project Structure

```
solar-crawler/
├── 📄 index.html              # Entry point HTML file
├── 📄 index.ts               # Main game initialization
├── 📁 assets/                # All game resources
│   ├── 🖼️ player.png
│   ├── 🖼️ asteroid.png
│   ├── 🖼️ kamikaze.png
│   ├── 🖼️ gunner.png
│   ├── 🖼️ leaper.png
│   ├── 🖼️ bullet.png
│   ├── 🖼️ enemy_bullet.png
│   ├── 🖼️ explosion.png
│   ├── 🖼️ background.png
│   ├── 🎵 menu.mp3
│   ├── 🎵 space-ambient-cinematic-music-345394.mp3
│   ├── 🎵 shot.mp3
│   └── 🎵 explosion.mp3
├── 📁 docs/                  # Project documentation
│   ├── 📄 prd.md            # Product Requirements Document
│   ├── 📄 design.md         # Game Design Document
│   ├── 📄 todo.md           # Development progress & issues
│   └── 📄 architecture.md   # This file
├── 📁 src/                   # Source code
│   ├── 📄 Player.ts         # Player class
│   ├── 📄 GameUI.ts         # UI system and input handling
│   ├── 📄 AudioManager.ts   # Audio system and music management
│   ├── 📄 ExplosionManager.ts # Visual explosion effects system
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
- [x] Put all documentation in `docs/`

### **DON'T:**
- [ ] Put source code files in root directory
- [ ] Mix configuration with game logic
- [ ] Put assets inside `src/` directory
- [ ] Create deep nested structures without reason
- [ ] Leave magic numbers scattered in code

---

## 🔮 Future Structure (As Game Grows)

```
src/
├── Player.ts                # Player class  
├── GameUI.ts                # UI system and input handling
├── AudioManager.ts          # Sound management (implemented)
├── ExplosionManager.ts      # Visual explosion effects (implemented)
├── enemies/                 # Enemy system (implemented)
│   ├── Enemy.ts             # Base enemy interface and class
│   ├── Asteroid.ts          # Asteroid enemy implementation
│   ├── Kamikaze.ts          # Kamikaze enemy implementation
│   ├── Gunner.ts            # Gunner enemy class (implemented)
│   ├── Leaper.ts            # Leaper enemy class (implemented)
│   └── EnemyManager.ts      # Enemy management system
├── Bullet.ts                # Bullet class (future)
├── WaveManager.ts           # Wave progression logic (future)
├── config/
│   ├── constants.ts         # Game constants
│   └── settings.ts          # Game settings (future)
├── scenes/                  # Scene system (implemented)
│   ├── MainMenuScene.ts     # Main menu
│   ├── AboutScene.ts        # About screen
│   ├── ControlsScene.ts     # Controls screen  
│   ├── CreditsScene.ts      # Credits screen
│   └── GameScene.ts         # Main gameplay
└── utils/
    ├── CollisionHelpers.ts  # Collision utilities
    └── MathHelpers.ts       # Math utilities (future)
```

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
- [ ] No console.log statements in production code
- [ ] All imports are organized correctly
- [ ] Constants used instead of magic numbers
- [ ] Documentation updated if needed

---

## 🎯 Benefits of This Structure

- [x] **Easy to navigate** - logical file locations
- [x] **Scalable** - can grow without becoming messy
- [x] **Maintainable** - clear separation of concerns
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
```typescript
interface VolumeSettings {
    master: number;        // 0.0 to 1.0 (default: 0.5)
    music: number;         // 0.0 to 1.0 (default: 0.5)  
    soundEffects: number;  // 0.0 to 1.0 (default: 0.5)
}

// Effective volume calculation:
// Music Volume = baseMusicVolume × master × music
// SFX Volume = baseSoundEffectVolume × master × soundEffects
```

**Usage Pattern:**
```typescript
// In preload() method of scenes
AudioManager.preload(this);

// In create() method 
this.audioManager = new AudioManager(this);
this.audioManager.playMenuMusic(); // or playGameMusic()

// Volume control
this.audioManager.setMasterVolume(0.7);
this.audioManager.setMusicVolume(0.5);
this.audioManager.setSoundEffectsVolume(0.8);

// In destroy() method
this.audioManager.destroy();
```

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
```typescript
// Different explosion sizes based on enemy type
explodeSmall(x, y)   // 0.6x scale - for asteroids
explodeMedium(x, y)  // 0.8x scale - for kamikazes and gunners  
explodeLarge(x, y)   // 1.2x scale - for leapers and player death
```

**Visual Components:**
1. **Explosion Sprite Animation:**
   - Starts at 0.1x scale, grows to 1.5x target size
   - Fades from 90% to 0% alpha over 400ms
   - Uses Power2 easing for smooth animation
   - Automatic sprite cleanup after animation

2. **Particle Effects:**
   - Orange-red gradient particles (programmatically generated)
   - Random velocities and directions (360° spread)
   - Particle rotation and scale animation
   - Configurable quantity based on explosion intensity

**Usage Pattern:**
```typescript
// In preload() method
ExplosionManager.preload(this);

// In create() method
this.explosionManager = new ExplosionManager(this);
this.explosionManager.create();

// Trigger explosions
this.explosionManager.explodeSmall(enemy.x, enemy.y);   // Asteroid
this.explosionManager.explodeMedium(enemy.x, enemy.y);  // Kamikaze/Gunner
this.explosionManager.explodeLarge(enemy.x, enemy.y);   // Leaper/Player

// Cleanup
this.explosionManager.destroy();
```

**Assets:**
- **`explosion.png`** - Main explosion sprite texture
- **Programmatic particles** - Generated orange-red circular textures

**Integration:**
- Integrated with EnemyManager for automatic explosion triggering
- Synchronized with AudioManager for combined audio-visual effects
- Proper cleanup in GameScene destroy method
- Performance optimized with single particle emitter reuse

---

## 📋 Code Standards

### Language Policy
**English Only**: This project uses English exclusively for all code, comments, documentation, and assets. No other languages are permitted, including in code comments. The game is developed in English with no current localization plans.
