import { BaseEnemy } from './Enemy';
import { ASTEROID_CONFIG, SCORE_CONFIG } from '../config/constants';
import { setupCircularCollision } from '../utils/CollisionHelpers';

export class Asteroid extends BaseEnemy {
    public scoreValue = SCORE_CONFIG.ASTEROID;

    // Asset loading
    static preload(scene: Phaser.Scene): void {
        scene.load.image('asteroid', 'assets/asteroid.png');
    }

    spawn(x: number, y: number): void {
        // Get sprite from group
        this.sprite = this.group.get(x, y, 'asteroid') as Phaser.Physics.Arcade.Sprite;

        if (this.sprite) {
            this.sprite.setActive(true);
            this.sprite.setVisible(true);
            this.sprite.setOrigin(0.5, 0.5);
            this.sprite.setScale(ASTEROID_CONFIG.SCALE);
            this.sprite.setVelocityX(ASTEROID_CONFIG.SPEED);
            this.sprite.setVelocityY(0);

            // Set up collision using dynamic calculation
            setupCircularCollision(this.sprite, 0.9);

            this.isActive = true;
        }
    }

    update(playerX: number, playerY: number): void {
        // Asteroids don't need special update logic - they just move straight
        // Physics handles the movement based on velocity set in spawn()
    }

    shouldCleanup(gameWidth: number, gameHeight: number): boolean {
        if (!this.isActive || !this.sprite.active) {
            return false;
        }

        // Cleanup when asteroid moves off the left side of screen
        return this.sprite.x < -100;
    }
}
