import { GUNNER_CONFIG, SCORE_CONFIG } from '../config/constants';
import { BaseEnemy } from './Enemy';
import { setupCircularCollision } from '../utils/CollisionHelpers';
import { AudioManager } from '../AudioManager';

export class Gunner extends BaseEnemy {
    public scoreValue = SCORE_CONFIG.GUNNER;
    public maxHP = GUNNER_CONFIG.MAX_HP;
    private lastFireTime: number = 0;
    private bullets: Phaser.Physics.Arcade.Group;
    private audioManager?: AudioManager;

    constructor(
        scene: Phaser.Scene,
        group: Phaser.Physics.Arcade.Group,
        bullets: Phaser.Physics.Arcade.Group
    ) {
        super(scene, group);
        this.bullets = bullets;
    }

    // Set audio manager for sound effects
    setAudioManager(audioManager: AudioManager): void {
        this.audioManager = audioManager;
    }

    public static preload(scene: Phaser.Scene): void {
        scene.load.image('gunner', 'assets/gunner.png');
        scene.load.image('enemy_bullet', 'assets/enemy_bullet.png');
    }

    spawn(x: number, y: number): void {
        // Clean up any existing health bar from previous use
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }
        
        // Get sprite from group
        this.sprite = this.group.get(x, y, 'gunner') as Phaser.Physics.Arcade.Sprite;

        if (this.sprite) {
            this.sprite.setActive(true);
            this.sprite.setVisible(true);
            this.sprite.setOrigin(0.5, 0.5);
            this.sprite.setScale(GUNNER_CONFIG.SCALE);
            this.sprite.setVelocityX(GUNNER_CONFIG.SPEED);
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
        // Get a bullet from the pool (creates new one if needed)
        const bullet = this.bullets.get(
            this.sprite.x - 30,
            this.sprite.y,
            'enemy_bullet'
        ) as Phaser.Physics.Arcade.Sprite;

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setScale(GUNNER_CONFIG.BULLET_SCALE);
            bullet.setOrigin(0.5, 0.5);

            // Set up circular collision for enemy bullet
            setupCircularCollision(bullet, 0.9);

            // Set bullet velocity
            bullet.setVelocity(GUNNER_CONFIG.BULLET_SPEED, 0);

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
}
