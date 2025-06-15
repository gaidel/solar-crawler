import { PLAYER_CONFIG, BULLET_CONFIG } from './config/constants';
import { setupCircularCollision } from './utils/CollisionHelpers';

export interface PlayerInput {
    moveUp: boolean;
    moveDown: boolean;
    action: boolean; // ENTER/SPACE for manual firing
}

import { AudioManager } from './AudioManager';

export class Player {
    // Asset loading
    static preload(scene: Phaser.Scene): void {
        scene.load.image('player', 'assets/player.png');
        scene.load.image('bullet', 'assets/bullet.png');
    }
    private sprite!: Phaser.Physics.Arcade.Sprite;
    private scene: Phaser.Scene;
    private bullets!: Phaser.Physics.Arcade.Group;
    private audioManager?: AudioManager;
    private lastFired = 0;

    // HP System
    private maxHP: number = 100;
    private currentHP: number = 100;
    private damageFlashTimer: Phaser.Time.TimerEvent | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    // Set audio manager for sound effects
    setAudioManager(audioManager: AudioManager): void {
        this.audioManager = audioManager;
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

        // Set up collision using dynamic calculation
        setupCircularCollision(this.sprite, 0.9); // Slightly smaller for forgiving gameplay
    }

    update(time: number, input: PlayerInput): void {
        // Handle player movement based on input commands
        if (input.moveUp) {
            this.sprite.setVelocityY(-PLAYER_CONFIG.SPEED);
        } else if (input.moveDown) {
            this.sprite.setVelocityY(PLAYER_CONFIG.SPEED);
        } else {
            this.sprite.setVelocityY(0);
        }

        // Enforce movement boundaries (avoid HUD area and screen edges)
        if (this.sprite.y < PLAYER_CONFIG.MOVEMENT_Y_MIN) {
            this.sprite.y = PLAYER_CONFIG.MOVEMENT_Y_MIN;
            this.sprite.setVelocityY(0);
        }
        if (this.sprite.y > PLAYER_CONFIG.MOVEMENT_Y_MAX) {
            this.sprite.y = PLAYER_CONFIG.MOVEMENT_Y_MAX;
            this.sprite.setVelocityY(0);
        }

        // Horizontal boundaries
        if (this.sprite.x < 0) {
            this.sprite.x = 0;
        }
        if (this.sprite.x > this.scene.physics.world.bounds.width) {
            this.sprite.x = this.scene.physics.world.bounds.width;
        }

        // Auto-fire bullets OR manual fire on action key
        if (time > this.lastFired && (true || input.action)) {
            // Auto-fire always enabled
            this.fireBullet();
            this.lastFired = time + PLAYER_CONFIG.FIRE_RATE;
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
            bullet.setScale(BULLET_CONFIG.SCALE);
            bullet.setVelocityX(BULLET_CONFIG.SPEED);
            bullet.setVelocityY(0); // Explicitly set Y velocity to 0 for straight movement
            bullet.clearTint(); // Make sure bullet has no tint

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

    // HP System methods
    takeDamage(damage: number): boolean {
        this.currentHP -= damage;

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

    // Game state methods
    setTint(color: number): void {
        this.sprite.setTint(color);
    }

    reset(): void {
        // Reset position
        this.sprite.setPosition(PLAYER_CONFIG.START_X, PLAYER_CONFIG.START_Y);
        this.sprite.setVelocity(0, 0);

        // Reset HP
        this.currentHP = this.maxHP;

        // Clear any visual effects
        this.sprite.clearTint();

        // Clear damage flash timer if it exists
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
            this.damageFlashTimer = null;
        }

        // Reset firing timer
        this.lastFired = 0;
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

        // Reset firing timer
        this.lastFired = 0;
    }

    destroy(): void {
        // Clear damage flash timer if it exists
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
            this.damageFlashTimer = null;
        }

        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
