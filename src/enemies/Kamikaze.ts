import { BaseEnemy } from './Enemy';
import { KAMIKAZE_CONFIG, SCORE_CONFIG } from '../config/constants';
import { setupCircularCollision } from '../utils/CollisionHelpers';

export enum KamikazeType {
    NORMAL = 'normal',
    FAST = 'fast'
}

export class Kamikaze extends BaseEnemy {
    public scoreValue: number;
    public maxHP: number;
    public collisionDamage: number;
    private kamikazeType: KamikazeType;
    private homingSpeed: number;

    constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
        super(scene, group);
        // Default values - will be set properly in spawn()
        this.kamikazeType = KamikazeType.NORMAL;
        this.scoreValue = KAMIKAZE_CONFIG.NORMAL.SCORE_VALUE;
        this.maxHP = KAMIKAZE_CONFIG.NORMAL.MAX_HP;
        this.collisionDamage = KAMIKAZE_CONFIG.NORMAL.COLLISION_DAMAGE;
        this.homingSpeed = KAMIKAZE_CONFIG.NORMAL.HOMING_SPEED;
    }

    // Asset loading
    static preload(scene: Phaser.Scene): void {
        scene.load.image('kamikaze', 'assets/kamikaze.png');
    }

    spawn(x: number, y: number, type?: KamikazeType): void {
        // Clean up any existing health bar from previous use
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }
        
        // Determine kamikaze type (random if not specified)
        if (type) {
            this.kamikazeType = type;
        } else {
            // Weighted random selection
            const random = Math.random() * 100;
            this.kamikazeType = random < KAMIKAZE_CONFIG.NORMAL.SPAWN_WEIGHT 
                ? KamikazeType.NORMAL 
                : KamikazeType.FAST;
        }
        
        // Set properties based on type
        const config = this.kamikazeType === KamikazeType.NORMAL 
            ? KAMIKAZE_CONFIG.NORMAL 
            : KAMIKAZE_CONFIG.FAST;
            
        this.scoreValue = config.SCORE_VALUE;
        this.maxHP = config.MAX_HP;
        this.collisionDamage = config.COLLISION_DAMAGE;
        this.homingSpeed = config.HOMING_SPEED;
        
        // Get sprite from group
        this.sprite = this.group.get(x, y, 'kamikaze') as Phaser.Physics.Arcade.Sprite;

        if (this.sprite) {
            this.sprite.setActive(true);
            this.sprite.setVisible(true);
            this.sprite.setOrigin(0.5, 0.5);
            this.sprite.setScale(config.SCALE);
            this.sprite.setFlipX(true); // Flip horizontally so the front points toward player
            this.sprite.setVelocityX(0); // Start without movement, homing system will handle it
            this.sprite.setVelocityY(0);

            // Clear tint to show original sprite colors
            this.sprite.clearTint();
            
            // Add visual indicator for fast kamikaze (slight red tint)
            if (this.kamikazeType === KamikazeType.FAST) {
                this.sprite.setTint(0xffaaaa); // Light red tint for fast kamikaze
            }

            // Set up collision using dynamic calculation
            setupCircularCollision(this.sprite, 0.9);

            // Initialize HP
            this.currentHP = this.maxHP;

            this.isActive = true;
        }
    }

    update(playerX: number, playerY: number): void {
        if (!this.isActive || !this.sprite.active) {
            return;
        }

        // Calculate direction vector to player
        const deltaX = playerX - this.sprite.x;
        const deltaY = playerY - this.sprite.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Only home if player is reasonably far
        if (distance > 10) {
            // Normalize the direction vector and apply speed
            const normalizedX = deltaX / distance;
            const normalizedY = deltaY / distance;

            // Use type-specific homing speed
            const speed = Math.abs(this.homingSpeed);
            this.sprite.setVelocityX(normalizedX * speed);
            this.sprite.setVelocityY(normalizedY * speed);
        } else {
            // Stop moving when very close to player
            this.sprite.setVelocityX(0);
            this.sprite.setVelocityY(0);
        }

        // Update health bar position if damaged
        this.updateHealthBarPosition();
    }

    shouldCleanup(gameWidth: number, gameHeight: number): boolean {
        if (!this.isActive || !this.sprite.active) {
            return false;
        }

        // Kamikazes can move in any direction, so check all boundaries
        return (
            this.sprite.x < -100 ||
            this.sprite.x > gameWidth + 100 ||
            this.sprite.y < -100 ||
            this.sprite.y > gameHeight + 100
        );
    }

    // Getter for kamikaze type (useful for debugging or special effects)
    getType(): KamikazeType {
        return this.kamikazeType;
    }

    // Getter for collision damage (used by collision system)
    getCollisionDamage(): number {
        return this.collisionDamage;
    }
}
