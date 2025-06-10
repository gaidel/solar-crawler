import { BaseEnemy } from './Enemy';
import { KAMIKAZE_CONFIG, SCORE_CONFIG } from '../config/constants';
import { setupCircularCollision } from '../utils/CollisionHelpers';

export class Kamikaze extends BaseEnemy {
    public scoreValue = SCORE_CONFIG.KAMIKAZE;

    // Asset loading
    static preload(scene: Phaser.Scene): void {
        scene.load.image('kamikaze', 'assets/kamikaze.png');
    }

    spawn(x: number, y: number): void {
        // Get sprite from group
        this.sprite = this.group.get(x, y, 'kamikaze') as Phaser.Physics.Arcade.Sprite;

        if (this.sprite) {
            this.sprite.setActive(true);
            this.sprite.setVisible(true);
            this.sprite.setOrigin(0.5, 0.5);
            this.sprite.setScale(KAMIKAZE_CONFIG.SCALE);
            this.sprite.setFlipX(true); // Flip horizontally so the front points toward player
            this.sprite.setVelocityX(0); // Start without movement, homing system will handle it
            this.sprite.setVelocityY(0);

            // Clear tint to show original sprite colors
            this.sprite.clearTint();

            // Set up collision using dynamic calculation
            setupCircularCollision(this.sprite, 0.9);

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

            // Use absolute value of HOMING_SPEED as the total speed
            const speed = Math.abs(KAMIKAZE_CONFIG.HOMING_SPEED);
            this.sprite.setVelocityX(normalizedX * speed);
            this.sprite.setVelocityY(normalizedY * speed);
        } else {
            // Stop moving when very close to player
            this.sprite.setVelocityX(0);
            this.sprite.setVelocityY(0);
        }
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
}
