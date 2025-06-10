import { Enemy } from './Enemy';
import { Asteroid } from './Asteroid';
import { Kamikaze } from './Kamikaze';
import { ASTEROID_CONFIG, KAMIKAZE_CONFIG, GAME_CONFIG } from '../config/constants';

export class EnemyManager {
    // Asset loading
    static preload(scene: Phaser.Scene): void {
        Asteroid.preload(scene);
        Kamikaze.preload(scene);
    }

    private scene: Phaser.Scene;
    private asteroidGroup!: Phaser.Physics.Arcade.Group;
    private kamikazeGroup!: Phaser.Physics.Arcade.Group;

    private asteroids: Asteroid[] = [];
    private kamikazes: Kamikaze[] = [];

    // Timers for spawning
    private asteroidTimer!: Phaser.Time.TimerEvent;
    private kamikazeTimer!: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    create(): void {
        // Create groups for different enemy types
        this.asteroidGroup = this.scene.physics.add.group({
            defaultKey: 'asteroid',
            maxSize: ASTEROID_CONFIG.MAX_POOL_SIZE,
        });

        this.kamikazeGroup = this.scene.physics.add.group({
            defaultKey: 'kamikaze',
            maxSize: KAMIKAZE_CONFIG.MAX_POOL_SIZE,
        });

        // Create enemy instances for pooling
        this.initializeEnemyPools();

        // Start spawning timers
        this.startSpawning();
    }

    private initializeEnemyPools(): void {
        // Initialize asteroid pool
        for (let i = 0; i < ASTEROID_CONFIG.MAX_POOL_SIZE; i++) {
            this.asteroids.push(new Asteroid(this.scene, this.asteroidGroup));
        }

        // Initialize kamikaze pool
        for (let i = 0; i < KAMIKAZE_CONFIG.MAX_POOL_SIZE; i++) {
            this.kamikazes.push(new Kamikaze(this.scene, this.kamikazeGroup));
        }
    }

    private startSpawning(): void {
        // Start asteroid spawning timer
        this.asteroidTimer = this.scene.time.addEvent({
            delay: ASTEROID_CONFIG.SPAWN_INTERVAL,
            callback: this.spawnAsteroid,
            callbackScope: this,
            loop: true,
        });

        // Start kamikaze spawning timer
        this.kamikazeTimer = this.scene.time.addEvent({
            delay: KAMIKAZE_CONFIG.SPAWN_INTERVAL,
            callback: this.spawnKamikaze,
            callbackScope: this,
            loop: true,
        });
    }

    private spawnAsteroid(): void {
        // Find an inactive asteroid to reuse
        const asteroid = this.asteroids.find((a) => !a.isActive);
        if (asteroid) {
            const y = Phaser.Math.Between(ASTEROID_CONFIG.SPAWN_Y_MIN, ASTEROID_CONFIG.SPAWN_Y_MAX);
            asteroid.spawn(ASTEROID_CONFIG.SPAWN_X, y);
        }
    }

    private spawnKamikaze(): void {
        // Find an inactive kamikaze to reuse
        const kamikaze = this.kamikazes.find((k) => !k.isActive);
        if (kamikaze) {
            const y = Phaser.Math.Between(KAMIKAZE_CONFIG.SPAWN_Y_MIN, KAMIKAZE_CONFIG.SPAWN_Y_MAX);
            kamikaze.spawn(KAMIKAZE_CONFIG.SPAWN_X, y);
        }
    }

    update(playerX: number, playerY: number): void {
        // Update all active enemies
        this.asteroids.forEach((asteroid) => {
            if (asteroid.isActive) {
                asteroid.update(playerX, playerY);

                // Check if should be cleaned up
                if (asteroid.shouldCleanup(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT)) {
                    asteroid.reset();
                }
            }
        });

        this.kamikazes.forEach((kamikaze) => {
            if (kamikaze.isActive) {
                kamikaze.update(playerX, playerY);

                // Check if should be cleaned up
                if (kamikaze.shouldCleanup(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT)) {
                    kamikaze.reset();
                }
            }
        });
    }

    // Handle collisions with bullets
    handleBulletCollision(enemy: Phaser.Physics.Arcade.Sprite): number {
        // Find which enemy was hit and return its score value
        let scoreValue = 0;

        // Check asteroids
        for (const asteroid of this.asteroids) {
            if (asteroid.isActive && asteroid.sprite === enemy) {
                scoreValue = asteroid.scoreValue;
                asteroid.onHit();
                break;
            }
        }

        // Check kamikazes
        for (const kamikaze of this.kamikazes) {
            if (kamikaze.isActive && kamikaze.sprite === enemy) {
                scoreValue = kamikaze.scoreValue;
                kamikaze.onHit();
                break;
            }
        }

        return scoreValue;
    }

    // Get groups for collision detection
    getAsteroidGroup(): Phaser.Physics.Arcade.Group {
        return this.asteroidGroup;
    }

    getKamikazeGroup(): Phaser.Physics.Arcade.Group {
        return this.kamikazeGroup;
    }

    // Stop spawning (for game over states)
    stopSpawning(): void {
        if (this.asteroidTimer) {
            this.asteroidTimer.remove();
        }
        if (this.kamikazeTimer) {
            this.kamikazeTimer.remove();
        }
    }

    // Reset all enemies
    reset(): void {
        this.asteroids.forEach((asteroid) => asteroid.reset());
        this.kamikazes.forEach((kamikaze) => kamikaze.reset());
    }

    destroy(): void {
        this.stopSpawning();
        this.asteroids.forEach((asteroid) => asteroid.destroy());
        this.kamikazes.forEach((kamikaze) => kamikaze.destroy());
        this.asteroids = [];
        this.kamikazes = [];
    }
}
