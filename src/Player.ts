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

        this.sprite.setCollideWorldBounds(true);
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

    // Game state methods
    setTint(color: number): void {
        this.sprite.setTint(color);
    }

    destroy(): void {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
