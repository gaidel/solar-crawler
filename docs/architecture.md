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
│   ├── 📄 todo.md           # Development checklist
│   ├── 📄 issues.md         # Known issues and bugs
│   └── 📄 architecture.md   # This file
├── 📁 src/                   # Source code
│   ├── 📁 config/           # Configuration and constants
│   │   └── 📄 constants.ts  # Game constants and helpers
│   └── 📁 scenes/           # Phaser scenes
│       └── 📄 GameScene.ts  # Main game scene
├── 📄 package.json          # Dependencies and scripts
├── 📄 tsconfig.json         # TypeScript configuration
├── 📄 vite.config.ts        # Build tool configuration
├── 📄 webpack.config.js     # Alternative build config
├── 📄 .eslintrc.js          # Code linting rules
├── 📄 .prettierrc           # Code formatting rules
├── 📄 .gitignore            # Git ignore patterns
└── 📁 node_modules/         # Installed dependencies
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

### ✅ **DO:**
- Put all TypeScript source files in `src/`
- Put game constants in `src/config/constants.ts`
- Put Phaser scenes in `src/scenes/`
- Put utility functions in `src/utils/` (when created)
- Put game entities in `src/entities/` (when created)
- Put all images/sounds in `assets/`
- Put all documentation in `docs/`

### ❌ **DON'T:**
- Put source code files in root directory
- Mix configuration with game logic
- Put assets inside `src/` directory
- Create deep nested structures without reason
- Leave magic numbers scattered in code

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
- **camelCase** for utilities and helpers (`constants.ts`, `mathHelpers.ts`)
- **kebab-case** for documentation (`architecture.md`, `game-design.md`)

---

## 🛠️ Maintenance Guidelines

### 🔄 **When Adding New Features:**
1. **Identify the category** (scene, entity, system, utility)
2. **Create appropriate directory** if needed
3. **Update constants** instead of hardcoding values
4. **Add to documentation** if it's a major feature

### 🧹 **Regular Cleanup:**
- **Remove unused files** and imports
- **Consolidate similar functionality**
- **Update documentation** when structure changes
- **Review and refactor** constants regularly

---

## 🎯 Benefits of This Structure

- ✅ **Easy to navigate** - logical file locations
- ✅ **Scalable** - can grow without becoming messy
- ✅ **Maintainable** - clear separation of concerns
- ✅ **Collaborative** - new developers can understand quickly
- ✅ **Professional** - industry-standard organization 