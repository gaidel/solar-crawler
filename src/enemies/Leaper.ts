import { LEAPER_CONFIG } from '../config/constants';
import { BaseEnemy } from './Enemy';
import { setupCircularCollision } from '../utils/CollisionHelpers';

export enum LeaperType {
    NORMAL = 'normal',
    WIDE = 'wide',
    SLOW = 'slow',
}

export class Leaper extends BaseEnemy {
    public scoreValue: number;
    public maxHP: number;
    public collisionDamage: number;
    private leaperType: LeaperType;
    private startY: number = 0;
    private startTime: number = 0;
    private zigzagAmplitude: number;
    private zigzagFrequency: number;

    constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
        super(scene, group);
        // Default values - will be set properly in spawn()
        this.leaperType = LeaperType.NORMAL;
        this.scoreValue = LEAPER_CONFIG.NORMAL.SCORE_VALUE;
        this.maxHP = LEAPER_CONFIG.NORMAL.MAX_HP;
        this.collisionDamage = LEAPER_CONFIG.NORMAL.COLLISION_DAMAGE;
        this.zigzagAmplitude = LEAPER_CONFIG.NORMAL.ZIGZAG_AMPLITUDE;
        this.zigzagFrequency = LEAPER_CONFIG.NORMAL.ZIGZAG_FREQUENCY;
    }

    public static preload(scene: Phaser.Scene): void {
        scene.load.image('leaper', 'assets/leaper.png');
    }

    spawn(x: number, y: number, type?: LeaperType): void {
        // Clean up any existing health bar from previous use
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }

        // Determine leaper type (random if not specified)
        if (type) {
            this.leaperType = type;
        } else {
            // Weighted random selection
            const random = Math.random() * 100;
            if (random < LEAPER_CONFIG.NORMAL.SPAWN_WEIGHT) {
                this.leaperType = LeaperType.NORMAL;
            } else if (
                random <
                LEAPER_CONFIG.NORMAL.SPAWN_WEIGHT + LEAPER_CONFIG.WIDE.SPAWN_WEIGHT
            ) {
                this.leaperType = LeaperType.WIDE;
            } else {
                this.leaperType = LeaperType.SLOW;
            }
        }

        // Set properties based on type
        const config =
            this.leaperType === LeaperType.NORMAL
                ? LEAPER_CONFIG.NORMAL
                : this.leaperType === LeaperType.WIDE
                  ? LEAPER_CONFIG.WIDE
                  : LEAPER_CONFIG.SLOW;

        this.scoreValue = config.SCORE_VALUE;
        this.maxHP = config.MAX_HP;
        this.collisionDamage = config.COLLISION_DAMAGE;
        this.zigzagAmplitude = config.ZIGZAG_AMPLITUDE;
        this.zigzagFrequency = config.ZIGZAG_FREQUENCY;

        // Get sprite from group
        this.sprite = this.group.get(x, y, 'leaper') as Phaser.Physics.Arcade.Sprite;

        if (this.sprite) {
            this.sprite.setActive(true);
            this.sprite.setVisible(true);
            this.sprite.setOrigin(0.5, 0.5);
            this.sprite.setScale(config.SCALE);
            this.sprite.setVelocityX(config.SPEED);
            this.sprite.setVelocityY(0);

            // Enable physics body for collisions
            if (this.sprite.body) {
                this.sprite.body.enable = true;
            }

            // Set up circular collision
            setupCircularCollision(this.sprite, 0.8);

            // Initialize HP
            this.currentHP = this.maxHP;

            this.isActive = true;
            this.startY = y;
            this.startTime = this.scene.time.now;
        }
    }

    update(_playerX: number, _playerY: number): void {
        if (!this.isActive || !this.sprite.active) {
            return;
        }

        // Calculate zigzag Y position using sine wave with type-specific parameters
        const elapsedTime = this.scene.time.now - this.startTime;
        const zigzagOffset = Math.sin(elapsedTime * this.zigzagFrequency) * this.zigzagAmplitude;
        const targetY = this.startY + zigzagOffset;

        // Set Y velocity to move towards target Y position
        const currentY = this.sprite.y;
        const yDifference = targetY - currentY;
        const yVelocity = yDifference * 3; // Multiplier for smooth movement

        this.sprite.setVelocityY(yVelocity);

        // Update health bar position if damaged
        this.updateHealthBarPosition();
    }

    shouldCleanup(_gameWidth: number, _gameHeight: number): boolean {
        if (!this.isActive || !this.sprite.active) {
            return false;
        }

        // Cleanup when leaper moves off the left side of screen
        return this.sprite.x < -100;
    }

    // Getter for leaper type (useful for debugging or special effects)
    getType(): LeaperType {
        return this.leaperType;
    }

    // Getter for collision damage (used by collision system)
    getCollisionDamage(): number {
        return this.collisionDamage;
    }
}
