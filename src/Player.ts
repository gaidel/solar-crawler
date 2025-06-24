import { PLAYER_CONFIG, BULLET_CONFIG, UPGRADE_CONFIG, DEPTH_CONFIG } from './config/constants';
import { setupPlayerCollision } from './utils/CollisionHelpers';
import { UpgradeManager } from './UpgradeManager';

export interface PlayerInput {
    moveUp: boolean;
    moveDown: boolean;
    action: boolean; // ENTER/SPACE for manual firing
}

import { AudioManager } from './AudioManager';

export class Player {
    // Asset loading
    static preload(scene: Phaser.Scene): void {
        scene.load.image('player', 'assets/images/player.png');
        scene.load.image('bullet', 'assets/images/projectiles/bullet.png');
    }
    private sprite!: Phaser.Physics.Arcade.Sprite;
    private scene: Phaser.Scene;
    private bullets!: Phaser.Physics.Arcade.Group;
    private audioManager?: AudioManager;
    private upgradeManager?: UpgradeManager;
    private lastFired = 0;

    // HP System
    private maxHP: number = PLAYER_CONFIG.BASE_MAX_HP;
    private currentHP: number = PLAYER_CONFIG.BASE_MAX_HP;
    private damageFlashTimer: Phaser.Time.TimerEvent | null = null;

    // Auto-repair system
    private autoRepairTimer: Phaser.Time.TimerEvent | null = null;

    // Phase Shield system (invincibility frames)
    private isInvincible: boolean = false;
    private invincibilityTimer: Phaser.Time.TimerEvent | null = null;
    private flickerTimer: Phaser.Time.TimerEvent | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    // Set audio manager for sound effects
    setAudioManager(audioManager: AudioManager): void {
        this.audioManager = audioManager;
    }

    // Set upgrade manager for upgrade effects
    setUpgradeManager(upgradeManager: UpgradeManager): void {
        this.upgradeManager = upgradeManager;
        this.updateStatsFromUpgrades();
        this.setupAutoRepair();
    }

    create(bullets: Phaser.Physics.Arcade.Group): void {
        // Store reference to bullets group
        this.bullets = bullets;

        // Create player sprite
        this.sprite = this.scene.physics.add.sprite(
            PLAYER_CONFIG.START_X,
            PLAYER_CONFIG.START_Y,
            'player'
        ) as Phaser.Physics.Arcade.Sprite;

        // Disable default world bounds collision, we'll handle it manually
        this.sprite.setCollideWorldBounds(false);
        this.sprite.setScale(PLAYER_CONFIG.SCALE);
        this.sprite.setOrigin(0.5, 0.5);

        // Set up optimized rectangular collision for player ship
        // Use configurable factors for easy tuning, with slight downward offset
        setupPlayerCollision(
            this.sprite,
            PLAYER_CONFIG.COLLISION_WIDTH_FACTOR,
            PLAYER_CONFIG.COLLISION_HEIGHT_FACTOR,
            PLAYER_CONFIG.COLLISION_OFFSET_Y
        );

        // Set player depth to render above enemies
        this.sprite.setDepth(DEPTH_CONFIG.PLAYER);
    }

    update(time: number, input: PlayerInput): void {
        // Calculate movement speed based on upgrades
        const movementSpeed = this.upgradeManager
            ? this.upgradeManager.calculateMovementSpeed(PLAYER_CONFIG.SPEED)
            : PLAYER_CONFIG.SPEED;

        // Handle player movement with boundary-aware velocity setting
        let velocityY = 0;

        if (input.moveUp) {
            // Only set upward velocity if not at top boundary
            if (this.sprite.y > PLAYER_CONFIG.MOVEMENT_Y_MIN) {
                velocityY = -movementSpeed;
            }
        } else if (input.moveDown) {
            // Only set downward velocity if not at bottom boundary
            if (this.sprite.y < PLAYER_CONFIG.MOVEMENT_Y_MAX) {
                velocityY = movementSpeed;
            }
        }

        this.sprite.setVelocityY(velocityY);

        // Enforce movement boundaries as safety net (should rarely trigger now)
        if (this.sprite.y < PLAYER_CONFIG.MOVEMENT_Y_MIN) {
            this.sprite.y = PLAYER_CONFIG.MOVEMENT_Y_MIN;
        }
        if (this.sprite.y > PLAYER_CONFIG.MOVEMENT_Y_MAX) {
            this.sprite.y = PLAYER_CONFIG.MOVEMENT_Y_MAX;
        }

        // Horizontal boundaries (keep existing logic as horizontal movement is not player-controlled)
        if (this.sprite.x < 0) {
            this.sprite.x = 0;
        }
        if (this.sprite.x > this.scene.physics.world.bounds.width) {
            this.sprite.x = this.scene.physics.world.bounds.width;
        }

        // Auto-fire bullets OR manual fire on action key
        const fireRate = this.upgradeManager
            ? this.upgradeManager.calculateFireRate(PLAYER_CONFIG.BASE_FIRE_RATE)
            : PLAYER_CONFIG.BASE_FIRE_RATE;

        if (time > this.lastFired && (true || input.action)) {
            // Auto-fire always enabled
            this.fireBullet();
            this.lastFired = time + fireRate;
        }
    }

    private fireBullet(): void {
        const bullet = this.bullets.get(
            this.sprite.x + BULLET_CONFIG.OFFSET_X,
            this.sprite.y,
            'bullet'
        );
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            // Use dynamic bullet scale based on upgrades
            const bulletScale = this.upgradeManager
                ? this.upgradeManager.calculateBulletScale()
                : BULLET_CONFIG.SCALE;
            bullet.setScale(bulletScale);

            // Use dynamic bullet speed based on upgrades
            const bulletSpeed = this.upgradeManager
                ? this.upgradeManager.calculateBulletSpeed()
                : BULLET_CONFIG.SPEED;
            bullet.setVelocityX(bulletSpeed);
            bullet.setVelocityY(0); // Explicitly set Y velocity to 0 for straight movement
            bullet.clearTint(); // Make sure bullet has no tint

            // Set proper depth for player bullets
            bullet.setDepth(DEPTH_CONFIG.PLAYER_BULLETS);

            // Re-enable physics body for collision detection
            if (bullet.body) {
                bullet.body.enable = true;
            }

            // Play shot sound effect
            if (this.audioManager) {
                this.audioManager.playShotSound();
            }
        }
    }

    // Getter methods for accessing sprite properties
    getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    getX(): number {
        return this.sprite.x;
    }

    getY(): number {
        return this.sprite.y;
    }

    // Get current bullet damage based on upgrades
    getBulletDamage(): number {
        return this.upgradeManager
            ? this.upgradeManager.calculateDamage(BULLET_CONFIG.BASE_DAMAGE)
            : BULLET_CONFIG.BASE_DAMAGE;
    }

    // HP System methods
    takeDamage(damage: number): boolean {
        // Check if player is currently invincible (Phase Shield)
        if (this.isInvincible) {
            return false; // No damage taken during invincibility
        }

        // Apply shield damage reduction if available
        const actualDamage = this.upgradeManager
            ? this.upgradeManager.calculateIncomingDamage(damage)
            : damage;

        this.currentHP -= actualDamage;

        // Activate Phase Shield if player has the upgrade
        if (this.upgradeManager && this.upgradeManager.hasPhaseShield()) {
            this.activatePhaseShield();
        } else {
            // Normal damage flash if no Phase Shield
            this.showDamageFlash();
        }

        if (this.currentHP <= 0) {
            this.currentHP = 0;
            return true; // Player destroyed
        }
        return false; // Player still alive
    }

    getCurrentHP(): number {
        return this.currentHP;
    }

    getMaxHP(): number {
        return this.maxHP;
    }

    getHPPercentage(): number {
        return this.currentHP / this.maxHP;
    }

    // Restore full health (cheat/debug method)
    restoreFullHealth(): void {
        this.currentHP = this.maxHP;
        console.log('[CHEAT] Player health restored to full (100 HP)');
    }

    // Heal player (with Energy Siphon or Auto-Repair)
    heal(amount: number): void {
        this.currentHP = Math.min(this.currentHP + amount, this.maxHP);
    }

    // Energy Siphon: Heal fixed amount on enemy kill
    onEnemyKilled(_enemyMaxHP: number): void {
        if (this.upgradeManager && this.upgradeManager.hasEnergySiphon()) {
            // Always heal 1 HP regardless of enemy max HP
            this.heal(1);
        }
    }

    // Update player stats based on current upgrades
    updateStatsFromUpgrades(): void {
        if (!this.upgradeManager) return;

        const oldMaxHP = this.maxHP;
        this.maxHP = this.upgradeManager.calculateMaxHP(PLAYER_CONFIG.BASE_MAX_HP);

        // If health upgrade was applied, increase current HP proportionally
        if (this.maxHP > oldMaxHP) {
            const hpIncrease = this.maxHP - oldMaxHP;
            this.currentHP += hpIncrease;
            console.log(
                `[UPGRADE] Health increased from ${oldMaxHP} to ${this.maxHP} (current: ${this.currentHP})`
            );
        }
    }

    // Setup auto-repair system (public method)
    setupAutoRepair(): void {
        if (this.autoRepairTimer) {
            this.autoRepairTimer.remove();
            this.autoRepairTimer = null;
        }

        if (this.upgradeManager && this.upgradeManager.hasAutoRepair()) {
            this.autoRepairTimer = this.scene.time.addEvent({
                delay: UPGRADE_CONFIG.AUTO_REPAIR_RATE,
                callback: () => {
                    if (this.currentHP < this.maxHP) {
                        this.heal(UPGRADE_CONFIG.AUTO_REPAIR_AMOUNT);
                    }
                },
                loop: true,
            });
        }
    }

    // Pause/Resume system methods
    private pauseStartTime: number = 0;

    pause(): void {
        // Record when the pause started
        this.pauseStartTime = this.scene.time.now;
    }

    resume(): void {
        // Calculate how long the pause lasted
        const pauseDuration = this.scene.time.now - this.pauseStartTime;

        // Adjust the firing timer to account for the pause duration
        // This prevents exploiting pause/resume for faster firing
        if (this.lastFired > 0) {
            this.lastFired += pauseDuration;
        }
    }

    // Phase Shield system methods
    private showDamageFlash(): void {
        // Visual feedback for damage (red flash)
        this.sprite.setTint(0xff0000); // Red tint

        // Clear any existing damage flash timer to prevent conflicts
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
        }

        // Create new timer to restore original color (200ms for player)
        this.damageFlashTimer = this.scene.time.delayedCall(200, () => {
            if (this.sprite && this.sprite.active) {
                this.sprite.clearTint();
            }
            this.damageFlashTimer = null;
        });
    }

    private activatePhaseShield(): void {
        // Set invincibility state
        this.isInvincible = true;

        // Clear any existing timers
        if (this.invincibilityTimer) {
            this.invincibilityTimer.remove();
        }
        if (this.flickerTimer) {
            this.flickerTimer.remove();
        }
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
            this.damageFlashTimer = null;
        }

        // Start flickering effect
        this.startFlickering();

        // Set timer to end invincibility
        this.invincibilityTimer = this.scene.time.delayedCall(
            UPGRADE_CONFIG.PHASE_SHIELD_DURATION,
            () => {
                this.deactivatePhaseShield();
            }
        );

        console.log('[PHASE_SHIELD] Activated for 2 seconds');
    }

    private startFlickering(): void {
        let isVisible = true;

        this.flickerTimer = this.scene.time.addEvent({
            delay: UPGRADE_CONFIG.PHASE_SHIELD_FLICKER_RATE,
            callback: () => {
                if (this.sprite && this.sprite.active) {
                    isVisible = !isVisible;
                    this.sprite.setAlpha(isVisible ? 1.0 : 0.3);
                }
            },
            loop: true,
        });
    }

    private deactivatePhaseShield(): void {
        // Clear invincibility state
        this.isInvincible = false;

        // Clear timers
        if (this.invincibilityTimer) {
            this.invincibilityTimer.remove();
            this.invincibilityTimer = null;
        }
        if (this.flickerTimer) {
            this.flickerTimer.remove();
            this.flickerTimer = null;
        }

        // Restore normal appearance
        if (this.sprite && this.sprite.active) {
            this.sprite.setAlpha(1.0);
            this.sprite.clearTint();
        }

        console.log('[PHASE_SHIELD] Deactivated');
    }

    // Check if player is currently invincible (for external use)
    isPlayerInvincible(): boolean {
        return this.isInvincible;
    }

    // Game state methods
    setTint(color: number): void {
        this.sprite.setTint(color);
    }

    reset(): void {
        // Reset position
        this.sprite.setPosition(PLAYER_CONFIG.START_X, PLAYER_CONFIG.START_Y);
        this.sprite.setVelocity(0, 0);

        // Reset HP (upgrades should persist between waves)
        this.maxHP = this.upgradeManager
            ? this.upgradeManager.calculateMaxHP(PLAYER_CONFIG.BASE_MAX_HP)
            : PLAYER_CONFIG.BASE_MAX_HP;
        this.currentHP = this.maxHP;

        // Clear any visual effects
        this.sprite.clearTint();

        // Clear damage flash timer if it exists
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
            this.damageFlashTimer = null;
        }

        // Clear Phase Shield timers and state
        this.deactivatePhaseShield();

        // Reset firing timer
        this.lastFired = 0;

        // Re-setup auto-repair after reset
        this.setupAutoRepair();
    }

    resetPosition(): void {
        // Reset position only (preserve HP between waves)
        this.sprite.setPosition(PLAYER_CONFIG.START_X, PLAYER_CONFIG.START_Y);
        this.sprite.setVelocity(0, 0);

        // Clear any visual effects
        this.sprite.clearTint();

        // Clear damage flash timer if it exists
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
            this.damageFlashTimer = null;
        }

        // Clear Phase Shield timers and state
        this.deactivatePhaseShield();

        // Reset firing timer
        this.lastFired = 0;
    }

    destroy(): void {
        // Clear damage flash timer if it exists
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
            this.damageFlashTimer = null;
        }

        // Clear auto-repair timer if it exists
        if (this.autoRepairTimer) {
            this.autoRepairTimer.remove();
            this.autoRepairTimer = null;
        }

        // Clear Phase Shield timers
        if (this.invincibilityTimer) {
            this.invincibilityTimer.remove();
            this.invincibilityTimer = null;
        }
        if (this.flickerTimer) {
            this.flickerTimer.remove();
            this.flickerTimer = null;
        }

        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
