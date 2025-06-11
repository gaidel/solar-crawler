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
│   ├── 🖼️ bullet.png
│   ├── 🖼️ background.png
│   ├── 🎵 menu.mp3
│   └── 🎵 space-ambient-cinematic-music-345394.mp3
├── 📁 docs/                  # Project documentation
│   ├── 📄 prd.md            # Product Requirements Document
│   ├── 📄 design.md         # Game Design Document
│   ├── 📄 todo.md           # Development progress & issues
│   └── 📄 architecture.md   # This file
├── 📁 src/                   # Source code
│   ├── 📄 Player.ts         # Player class
│   ├── 📄 GameUI.ts         # UI system and input handling
│   ├── 📄 AudioManager.ts   # Audio system and music management
│   ├── 📁 config/           # Configuration and constants
│   │   └── 📄 constants.ts  # Game constants and helpers
│   ├── 📁 enemies/          # Enemy system
│   │   ├── 📄 Enemy.ts      # Base enemy interface and class
│   │   ├── 📄 Asteroid.ts   # Asteroid enemy implementation
│   │   ├── 📄 Kamikaze.ts   # Kamikaze enemy implementation
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
├── enemies/                 # Enemy system (implemented)
│   ├── Enemy.ts             # Base enemy interface and class
│   ├── Asteroid.ts          # Asteroid enemy implementation
│   ├── Kamikaze.ts          # Kamikaze enemy implementation
│   ├── EnemyManager.ts      # Enemy management system
│   ├── Gunner.ts            # Gunner enemy class (future)
│   └── Leaper.ts            # Leaper enemy class (future)
├── Bullet.ts                # Bullet class (future)
├── WaveManager.ts           # Wave progression logic (future)
├── AudioManager.ts          # Sound management (implemented)
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
- **Volume Control** - Adjustable volume levels per audio type
- **Cleanup & Memory Management** - Proper disposal of audio resources
- **Error Handling** - Graceful fallback when audio fails
- **Autoplay Policy Handling** - Progressive retry system for blocked autoplay

**Usage Pattern:**
```typescript
// In preload() method of scenes
AudioManager.preload(this);

// In create() method 
this.audioManager = new AudioManager(this);
this.audioManager.playMenuMusic(); // or playGameMusic()

// In destroy() method
this.audioManager.destroy();
```

**Audio Files:**
- **`menu.mp3`** - Looping background music for menu system (volume: 0.3)
- **`space-ambient-cinematic-music-345394.mp3`** - Looping background music for gameplay (volume: 0.4)

**Integration:**
- All scenes load audio assets via `AudioManager.preload()`
- MainMenuScene plays menu music automatically  
- GameScene plays game music automatically
- Proper cleanup when switching between scenes

### **Browser Autoplay Policy Handling**

Modern browsers block automatic audio playback. The system handles this gracefully:

**Current Implementation:**
- **Automatic retry**: 10 attempts with progressive delays (1s, 2s, 3s... up to 10s)
- **AudioContext resume**: Attempts to resume suspended audio context
- **User interaction fallback**: Guaranteed to work on first user input

**Development Workarounds:**
For development, you can disable autoplay restrictions:

#### Chrome/Edge:
```bash
# Windows
chrome.exe --autoplay-policy=no-user-gesture-required --disable-features=PreloadMediaEngagementData
```

#### Site Settings:
1. Click **🔒 lock icon** in address bar → **Site settings** → Set **Sound** to **Allow**

**Production Behavior:**
1. Attempts autoplay on scene load
2. Shows no error if blocked  
3. Starts music immediately on first user interaction
4. No additional UI required

---

## 📋 Code Standards

### Language Policy
**English Only**: This project uses English exclusively for all code, comments, documentation, and assets. No other languages are permitted, including in code comments. The game is developed in English with no current localization plans.
