import { LEAPER_CONFIG, SCORE_CONFIG } from '../config/constants';
import { BaseEnemy } from './Enemy';
import { setupCircularCollision } from '../utils/CollisionHelpers';

export class Leaper extends BaseEnemy {
    public scoreValue = SCORE_CONFIG.LEAPER;
    public maxHP = LEAPER_CONFIG.MAX_HP;
    private startY: number = 0;
    private startTime: number = 0;

    constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
        super(scene, group);
    }

    public static preload(scene: Phaser.Scene): void {
        scene.load.image('leaper', 'assets/leaper.png');
    }

    spawn(x: number, y: number): void {
        // Clean up any existing health bar from previous use
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }
        
        // Get sprite from group
        this.sprite = this.group.get(x, y, 'leaper') as Phaser.Physics.Arcade.Sprite;

        if (this.sprite) {
            this.sprite.setActive(true);
            this.sprite.setVisible(true);
            this.sprite.setOrigin(0.5, 0.5);
            this.sprite.setScale(LEAPER_CONFIG.SCALE);
            this.sprite.setVelocityX(LEAPER_CONFIG.SPEED);
            this.sprite.setVelocityY(0);

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

        // Calculate zigzag Y position using sine wave
        const elapsedTime = this.scene.time.now - this.startTime;
        const zigzagOffset =
            Math.sin(elapsedTime * LEAPER_CONFIG.ZIGZAG_FREQUENCY) * LEAPER_CONFIG.ZIGZAG_AMPLITUDE;
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
}
