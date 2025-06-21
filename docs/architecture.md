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

#### **Game Object Depth Assignment:**
```typescript
// Background elements
backgroundSprite.setDepth(0);

// Projectiles (behind characters)
enemyBullet.setDepth(5);
playerBullet.setDepth(6);

// Regular enemies
asteroid.setDepth(10);
gunner.setDepth(11);
kamikaze.setDepth(12);
leaper.setDepth(13);

// Boss enemies
mothership.setDepth(20);

// Player
playerSprite.setDepth(30);

// Effects
explosion.setDepth(40);

// HUD
hpBar.setDepth(100);
scoreText.setDepth(101);

// UI Overlays
pauseMenu.setDepth(200);
upgradeScreen.setDepth(201);
```

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

## 🎯 Enemy Bullet System Architecture

### **Bullet Pooling & Management** - Optimized Projectile System
The enemy bullet system provides efficient projectile management for Gunner enemies:

**Core Features:**
- **Object Pooling** - Reuses inactive bullets to prevent memory allocation
- **Explicit State Management** - Clear active/inactive bullet tracking
- **Optimized Cleanup** - Multi-boundary cleanup system
- **Physics Integration** - Proper collision detection with cleanup
- **Debug Statistics** - Development tools for troubleshooting

**Bullet Pool Configuration:**
```typescript
// EnemyManager.ts - Optimized settings
this.enemyBullets = this.scene.physics.add.group({
    defaultKey: 'enemy_bullet',
    maxSize: 20,  // Reduced from 50 for better control
    // runChildUpdate removed - manual update management
});
```

**Bullet Lifecycle Management:**
1. **Creation/Reuse** - `Gunner.fireBullet()` first searches for inactive bullets
2. **Activation** - Explicit position reset and physics body re-enabling
3. **Movement** - Horizontal velocity with collision detection
4. **Cleanup** - Multiple cleanup triggers for reliability

**Advanced Pooling Logic:**
```typescript
// Gunner.ts - Explicit bullet reuse
private fireBullet(): void {
    // First try to find an inactive bullet to reuse
    let bullet: Phaser.Physics.Arcade.Sprite | null = null;
    
    this.bullets.getChildren().forEach((child) => {
        if (!bullet && child instanceof Phaser.Physics.Arcade.Sprite && !child.active) {
            bullet = child;
        }
    });
    
    // If no inactive bullet found, get from pool
    if (!bullet) {
        bullet = this.bullets.get(x, y, 'enemy_bullet');
    }
    
    if (bullet) {
        // Reset bullet state completely
        bullet.setPosition(x, y);
        bullet.setActive(true);
        bullet.setVisible(true);
        if (bullet.body) {
            bullet.body.enable = true;  // Re-enable physics
        }
    }
}
```

**Multi-Level Cleanup System:**
```typescript
// EnemyManager.ts - Comprehensive cleanup
private cleanupEnemyBullets(): void {
    this.enemyBullets.getChildren().forEach((bullet) => {
        if (bullet instanceof Phaser.Physics.Arcade.Sprite) {
            // Cleanup off-screen bullets (both directions)
            if (bullet.active && (bullet.x < -50 || bullet.x > GAME_CONFIG.WIDTH + 100)) {
                bullet.setActive(false);
                bullet.setVisible(false);
                if (bullet.body) bullet.body.enable = false;
            }
            
            // Safety cleanup for inactive but visible bullets
            if (!bullet.active && bullet.visible) {
                bullet.setVisible(false);
                if (bullet.body) bullet.body.enable = false;
            }
        }
    });
}
```

**Collision Handling:**
```typescript
// GameScene.ts - Player-bullet collision
private handlePlayerBulletCollision(player, bullet): void {
    if (!bullet.active) return;  // Prevent double-processing
    
    // Player damage logic
    const playerDestroyed = this.player.takeDamage(DAMAGE_CONFIG.ENEMY_BULLET);
    
    // Simple bullet cleanup (no aggressive positioning)
    bullet.setActive(false);
    bullet.setVisible(false);
    if (bullet.body) bullet.body.enable = false;
}
```

**Debug & Monitoring:**
```typescript
// Development tool for bullet statistics
getBulletStats(): { total: number; active: number; visible: number } {
    let total = 0, active = 0, visible = 0;
    this.enemyBullets.getChildren().forEach((bullet) => {
        if (bullet instanceof Phaser.Physics.Arcade.Sprite) {
            total++;
            if (bullet.active) active++;
            if (bullet.visible) visible++;
        }
    });
    return { total, active, visible };
}
```

**Key Optimizations:**
- **Reduced Pool Size** - From 50 to 20 bullets maximum
- **Manual Update Management** - Removed `runChildUpdate: true` for better control
- **Explicit Reuse Logic** - Search inactive bullets before creating new ones
- **Multi-Boundary Cleanup** - Handle bullets going off-screen in both directions
- **State Consistency** - Ensure active/visible/physics states are synchronized
- **Simple Destruction** - Avoid complex positioning that can cause visual artifacts

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

**Implementation:**
```typescript
// GameScene.ts
private setupDebugCheats(): void {
    if (this.physics.world.debugGraphic) {
        this.vKey = this.input.keyboard!.addKey(KeyCodes.V);
        this.hKey = this.input.keyboard!.addKey(KeyCodes.H);
    }
}

private handleDebugCheats(): void {
    if (!this.physics.world.debugGraphic || this.gameState !== GameState.PLAYING) {
        return;
    }
    // Process V and H key inputs...
}
```

**Benefits:**
- **Faster Testing**: No need to play through entire waves to test features
- **Damage Testing**: Test HP system without repeated deaths
- **Wave Testing**: Quickly test wave transitions and victory screens
- **Debug Safety**: Only available in debug builds
- **Development Feedback**: Console logging for all cheat actions

---

## 📋 Code Standards

### Language Policy
**English Only**: This project uses English exclusively for all code, comments, documentation, and assets. No other languages are permitted, including in code comments. The game is developed in English with no current localization plans.
