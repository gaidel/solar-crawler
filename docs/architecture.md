# 🏗️ Project Architecture & File Structure

## 📁 Current Project Structure

```
solar-crawler/
├── 📄 index.html              # Entry point HTML file
├── 📄 index.ts               # Main game initialization
├── 📁 assets/                # All game resources
│   ├── 🖼️ player.png
│   ├── 🖼️ asteroid.png
│   ├── 🖼️ bullet.png
│   └── 🖼️ background.png
├── 📁 docs/                  # Project documentation
│   ├── 📄 prd.md            # Product Requirements Document
│   ├── 📄 design.md         # Game Design Document
│   ├── 📄 todo.md           # Development progress & issues
│   └── 📄 architecture.md   # This file
├── 📁 src/                   # Source code
│   ├── 📁 config/           # Configuration and constants
│   │   └── 📄 constants.ts  # Game constants and helpers
│   ├── 📁 scenes/           # Phaser scenes
│   │   └── 📄 GameScene.ts  # Main game scene
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
- [x] Put game entities in `src/entities/` (when created)
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
├── config/
│   ├── constants.ts         # Game constants
│   └── settings.ts          # Game settings
├── scenes/
│   ├── GameScene.ts         # Main gameplay
│   ├── MenuScene.ts         # Main menu
│   ├── GameOverScene.ts     # Game over screen
│   └── VictoryScene.ts      # Victory screen
├── entities/
│   ├── Player.ts            # Player class
│   ├── enemies/
│   │   ├── Asteroid.ts
│   │   ├── Kamikaze.ts
│   │   ├── Gunner.ts
│   │   └── Leaper.ts
│   └── Bullet.ts            # Bullet class
├── systems/
│   ├── WaveManager.ts       # Wave progression logic
│   ├── UpgradeSystem.ts     # Roguelike upgrades
│   └── AudioManager.ts      # Sound management
└── utils/
    ├── CollisionHelpers.ts  # Collision utilities
    └── MathHelpers.ts       # Math utilities
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

## 📋 Code Standards

### Language Policy
**English Only**: This project uses English exclusively for all code, comments, documentation, and assets. No other languages are permitted, including in code comments. The game is developed in English with no current localization plans.
