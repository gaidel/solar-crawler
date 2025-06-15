import { GUNNER_CONFIG, SCORE_CONFIG } from '../config/constants';
import { BaseEnemy } from './Enemy';
import { setupCircularCollision } from '../utils/CollisionHelpers';
import { AudioManager } from '../AudioManager';

export enum GunnerType {
    NORMAL = 'normal',
    LARGE = 'large'
}

export class Gunner extends BaseEnemy {
    public scoreValue: number;
    public maxHP: number;
    public collisionDamage: number;
    private gunnerType: GunnerType;
    private lastFireTime: number = 0;
    private bullets: Phaser.Physics.Arcade.Group;
    private audioManager?: AudioManager;
    private bulletSpeed: number;
    private bulletScale: number;

    constructor(
        scene: Phaser.Scene,
        group: Phaser.Physics.Arcade.Group,
        bullets: Phaser.Physics.Arcade.Group
    ) {
        super(scene, group);
        this.bullets = bullets;
        // Default values - will be set properly in spawn()
        this.gunnerType = GunnerType.NORMAL;
        this.scoreValue = GUNNER_CONFIG.NORMAL.SCORE_VALUE;
        this.maxHP = GUNNER_CONFIG.NORMAL.MAX_HP;
        this.collisionDamage = GUNNER_CONFIG.NORMAL.COLLISION_DAMAGE;
        this.bulletSpeed = GUNNER_CONFIG.NORMAL.BULLET_SPEED;
        this.bulletScale = GUNNER_CONFIG.NORMAL.BULLET_SCALE;
    }

    // Set audio manager for sound effects
    setAudioManager(audioManager: AudioManager): void {
        this.audioManager = audioManager;
    }

    public static preload(scene: Phaser.Scene): void {
        scene.load.image('gunner', 'assets/gunner.png');
        scene.load.image('enemy_bullet', 'assets/enemy_bullet.png');
    }

    spawn(x: number, y: number, type?: GunnerType): void {
        // Clean up any existing health bar from previous use
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }
        
        // Determine gunner type (random if not specified)
        if (type) {
            this.gunnerType = type;
        } else {
            // Weighted random selection
            const random = Math.random() * 100;
            this.gunnerType = random < GUNNER_CONFIG.NORMAL.SPAWN_WEIGHT 
                ? GunnerType.NORMAL 
                : GunnerType.LARGE;
        }
        
        // Set properties based on type
        const config = this.gunnerType === GunnerType.NORMAL 
            ? GUNNER_CONFIG.NORMAL 
            : GUNNER_CONFIG.LARGE;
            
        this.scoreValue = config.SCORE_VALUE;
        this.maxHP = config.MAX_HP;
        this.collisionDamage = config.COLLISION_DAMAGE;
        this.bulletSpeed = config.BULLET_SPEED;
        this.bulletScale = config.BULLET_SCALE;
        
        // Get sprite from group
        this.sprite = this.group.get(x, y, 'gunner') as Phaser.Physics.Arcade.Sprite;

        if (this.sprite) {
            this.sprite.setActive(true);
            this.sprite.setVisible(true);
            this.sprite.setOrigin(0.5, 0.5);
            this.sprite.setScale(config.SCALE);
            this.sprite.setVelocityX(config.SPEED);
            this.sprite.setVelocityY(0);

            // Set up circular collision
            setupCircularCollision(this.sprite, 0.8);

            // Initialize HP
            this.currentHP = this.maxHP;

            this.isActive = true;
            // First shot comes faster (500ms instead of full 2000ms)
            this.lastFireTime = this.scene.time.now - GUNNER_CONFIG.FIRE_RATE + 500;
        }
    }

    update(_playerX: number, _playerY: number): void {
        if (!this.isActive || !this.sprite.active) {
            return;
        }

        // Fire bullets periodically
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastFireTime > GUNNER_CONFIG.FIRE_RATE) {
            this.fireBullet();
            this.lastFireTime = currentTime;
        }

        // Update health bar position if damaged
        this.updateHealthBarPosition();
    }

    private fireBullet(): void {
        // First try to find an inactive bullet to reuse
        let bullet: Phaser.Physics.Arcade.Sprite | null = null;
        
        this.bullets.getChildren().forEach((child) => {
            if (!bullet && child instanceof Phaser.Physics.Arcade.Sprite && !child.active) {
                bullet = child;
            }
        });
        
        // If no inactive bullet found, try to get one from the pool
        if (!bullet) {
            bullet = this.bullets.get(
                this.sprite.x - 30,
                this.sprite.y,
                'enemy_bullet'
            ) as Phaser.Physics.Arcade.Sprite;
        }

        if (bullet) {
            // Reset bullet position and properties
            bullet.setPosition(this.sprite.x - 30, this.sprite.y);
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setScale(this.bulletScale); // Use type-specific bullet scale
            bullet.setOrigin(0.5, 0.5);

            // Enable physics body if it was disabled
            if (bullet.body) {
                bullet.body.enable = true;
            }

            // Set up circular collision for enemy bullet
            setupCircularCollision(bullet, 0.9);

            // Set bullet velocity (use type-specific speed)
            bullet.setVelocity(this.bulletSpeed, 0);

            // Play shot sound effect
            if (this.audioManager) {
                this.audioManager.playShotSound();
            }
        }
    }

    shouldCleanup(_gameWidth: number, _gameHeight: number): boolean {
        if (!this.isActive || !this.sprite.active) {
            return false;
        }

        // Cleanup when gunner moves off the left side of screen
        return this.sprite.x < -100;
    }

    // Getter for gunner type (useful for debugging or special effects)
    getType(): GunnerType {
        return this.gunnerType;
    }

    // Getter for collision damage (used by collision system)
    getCollisionDamage(): number {
        return this.collisionDamage;
    }
}
