import { BaseEnemy } from './Enemy';
import { ASTEROID_CONFIG } from '../config/constants';
import { setupCircularCollision } from '../utils/CollisionHelpers';

export enum AsteroidType {
    NORMAL = 'normal',
    LARGE = 'large',
}

export class Asteroid extends BaseEnemy {
    public scoreValue: number;
    public maxHP: number;
    public collisionDamage: number;
    private asteroidType: AsteroidType;

    constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
        super(scene, group);
        // Default values - will be set properly in spawn()
        this.asteroidType = AsteroidType.NORMAL;
        this.scoreValue = ASTEROID_CONFIG.NORMAL.SCORE_VALUE;
        this.maxHP = ASTEROID_CONFIG.NORMAL.MAX_HP;
        this.collisionDamage = ASTEROID_CONFIG.NORMAL.COLLISION_DAMAGE;
    }

    // Asset loading
    static preload(scene: Phaser.Scene): void {
        scene.load.image('asteroid', 'assets/images/enemies/asteroid.png');
    }

    spawn(x: number, y: number, type?: AsteroidType): void {
        // Clean up any existing health bar from previous use
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }

        // Determine asteroid type (random if not specified)
        if (type) {
            this.asteroidType = type;
        } else {
            // Weighted random selection
            const random = Math.random() * 100;
            this.asteroidType =
                random < ASTEROID_CONFIG.NORMAL.SPAWN_WEIGHT
                    ? AsteroidType.NORMAL
                    : AsteroidType.LARGE;
        }

        // Set properties based on type
        const config =
            this.asteroidType === AsteroidType.NORMAL
                ? ASTEROID_CONFIG.NORMAL
                : ASTEROID_CONFIG.LARGE;

        this.scoreValue = config.SCORE_VALUE;
        this.maxHP = config.MAX_HP;
        this.collisionDamage = config.COLLISION_DAMAGE;

        // Get sprite from group
        this.sprite = this.group.get(x, y, 'asteroid') as Phaser.Physics.Arcade.Sprite;

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

            // Set up collision using dynamic calculation
            setupCircularCollision(this.sprite, 0.9);

            // Initialize HP
            this.currentHP = this.maxHP;

            this.isActive = true;
        }
    }

    update(_playerX: number, _playerY: number): void {
        // Asteroids don't need special update logic - they just move straight
        // Physics handles the movement based on velocity set in spawn()

        // Update health bar position if damaged
        this.updateHealthBarPosition();
    }

    shouldCleanup(_gameWidth: number, _gameHeight: number): boolean {
        if (!this.isActive || !this.sprite.active) {
            return false;
        }

        // Cleanup when asteroid moves off the left side of screen
        return this.sprite.x < -100;
    }

    // Getter for asteroid type (useful for debugging or special effects)
    getType(): AsteroidType {
        return this.asteroidType;
    }

    // Getter for collision damage (used by collision system)
    getCollisionDamage(): number {
        return this.collisionDamage;
    }
}
