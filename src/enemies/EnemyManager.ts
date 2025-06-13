import { Enemy } from './Enemy';
import { Asteroid } from './Asteroid';
import { Kamikaze } from './Kamikaze';
import { Gunner } from './Gunner';
import { Leaper } from './Leaper';
import {
    ASTEROID_CONFIG,
    KAMIKAZE_CONFIG,
    GUNNER_CONFIG,
    LEAPER_CONFIG,
    GAME_CONFIG,
} from '../config/constants';

export class EnemyManager {
    // Asset loading
    static preload(scene: Phaser.Scene): void {
        Asteroid.preload(scene);
        Kamikaze.preload(scene);
        Gunner.preload(scene);
        Leaper.preload(scene);
    }

    private scene: Phaser.Scene;
    private asteroidGroup!: Phaser.Physics.Arcade.Group;
    private kamikazeGroup!: Phaser.Physics.Arcade.Group;
    private gunnerGroup!: Phaser.Physics.Arcade.Group;
    private leaperGroup!: Phaser.Physics.Arcade.Group;
    private enemyBullets!: Phaser.Physics.Arcade.Group;

    private asteroids: Asteroid[] = [];
    private kamikazes: Kamikaze[] = [];
    private gunners: Gunner[] = [];
    private leapers: Leaper[] = [];

    // Timers for spawning
    private asteroidTimer!: Phaser.Time.TimerEvent;
    private kamikazeTimer!: Phaser.Time.TimerEvent;
    private gunnerTimer!: Phaser.Time.TimerEvent;
    private leaperTimer!: Phaser.Time.TimerEvent;

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

        this.gunnerGroup = this.scene.physics.add.group({
            defaultKey: 'gunner',
            maxSize: GUNNER_CONFIG.MAX_POOL_SIZE,
        });

        this.leaperGroup = this.scene.physics.add.group({
            defaultKey: 'leaper',
            maxSize: LEAPER_CONFIG.MAX_POOL_SIZE,
        });

        // Create enemy bullets group
        this.enemyBullets = this.scene.physics.add.group({
            defaultKey: 'enemy_bullet',
            maxSize: 50,
            runChildUpdate: true,
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

        // Initialize gunner pool
        for (let i = 0; i < GUNNER_CONFIG.MAX_POOL_SIZE; i++) {
            this.gunners.push(new Gunner(this.scene, this.gunnerGroup, this.enemyBullets));
        }

        // Initialize leaper pool
        for (let i = 0; i < LEAPER_CONFIG.MAX_POOL_SIZE; i++) {
            this.leapers.push(new Leaper(this.scene, this.leaperGroup));
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

        // Start gunner spawning timer
        this.gunnerTimer = this.scene.time.addEvent({
            delay: GUNNER_CONFIG.SPAWN_INTERVAL,
            callback: this.spawnGunner,
            callbackScope: this,
            loop: true,
        });

        // Start leaper spawning timer
        this.leaperTimer = this.scene.time.addEvent({
            delay: LEAPER_CONFIG.SPAWN_INTERVAL,
            callback: this.spawnLeaper,
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

    private spawnGunner(): void {
        // Find an inactive gunner to reuse
        const gunner = this.gunners.find((g) => !g.isActive);
        if (gunner) {
            const y = Phaser.Math.Between(GUNNER_CONFIG.SPAWN_Y_MIN, GUNNER_CONFIG.SPAWN_Y_MAX);
            gunner.spawn(GUNNER_CONFIG.SPAWN_X, y);
        }
    }

    private spawnLeaper(): void {
        // Find an inactive leaper to reuse
        const leaper = this.leapers.find((l) => !l.isActive);
        if (leaper) {
            const y = Phaser.Math.Between(LEAPER_CONFIG.SPAWN_Y_MIN, LEAPER_CONFIG.SPAWN_Y_MAX);
            leaper.spawn(LEAPER_CONFIG.SPAWN_X, y);
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

        this.gunners.forEach((gunner) => {
            if (gunner.isActive) {
                gunner.update(playerX, playerY);

                // Check if should be cleaned up
                if (gunner.shouldCleanup(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT)) {
                    gunner.reset();
                }
            }
        });

        this.leapers.forEach((leaper) => {
            if (leaper.isActive) {
                leaper.update(playerX, playerY);

                // Check if should be cleaned up
                if (leaper.shouldCleanup(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT)) {
                    leaper.reset();
                }
            }
        });

        // Clean up enemy bullets
        this.cleanupEnemyBullets();
    }

    private cleanupEnemyBullets(): void {
        this.enemyBullets.getChildren().forEach((bullet) => {
            if (bullet instanceof Phaser.Physics.Arcade.Sprite && bullet.active && bullet.x < -50) {
                bullet.setActive(false);
                bullet.setVisible(false);
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

        // Check gunners
        for (const gunner of this.gunners) {
            if (gunner.isActive && gunner.sprite === enemy) {
                scoreValue = gunner.scoreValue;
                gunner.onHit();
                break;
            }
        }

        // Check leapers
        for (const leaper of this.leapers) {
            if (leaper.isActive && leaper.sprite === enemy) {
                scoreValue = leaper.scoreValue;
                leaper.onHit();
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

    getGunnerGroup(): Phaser.Physics.Arcade.Group {
        return this.gunnerGroup;
    }

    getLeaperGroup(): Phaser.Physics.Arcade.Group {
        return this.leaperGroup;
    }

    getEnemyBullets(): Phaser.Physics.Arcade.Group {
        return this.enemyBullets;
    }

    // Stop spawning (for game over states)
    stopSpawning(): void {
        if (this.asteroidTimer) {
            this.asteroidTimer.remove();
        }
        if (this.kamikazeTimer) {
            this.kamikazeTimer.remove();
        }
        if (this.gunnerTimer) {
            this.gunnerTimer.remove();
        }
        if (this.leaperTimer) {
            this.leaperTimer.remove();
        }
    }

    // Reset all enemies
    reset(): void {
        this.asteroids.forEach((asteroid) => asteroid.reset());
        this.kamikazes.forEach((kamikaze) => kamikaze.reset());
        this.gunners.forEach((gunner) => gunner.reset());
        this.leapers.forEach((leaper) => leaper.reset());

        // Reset enemy bullets
        this.enemyBullets.clear(true, true);
    }

    destroy(): void {
        this.stopSpawning();
        this.asteroids.forEach((asteroid) => asteroid.destroy());
        this.kamikazes.forEach((kamikaze) => kamikaze.destroy());
        this.gunners.forEach((gunner) => gunner.destroy());
        this.leapers.forEach((leaper) => leaper.destroy());
        this.asteroids = [];
        this.kamikazes = [];
        this.gunners = [];
        this.leapers = [];
    }
}
