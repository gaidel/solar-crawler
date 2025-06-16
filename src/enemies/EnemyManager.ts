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
    BULLET_CONFIG,
    WAVE_MODIFIERS,
} from '../config/constants';
import { AudioManager } from '../AudioManager';
import { ExplosionManager } from '../ExplosionManager';

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
    private audioManager?: AudioManager;
    private explosionManager?: ExplosionManager;

    private asteroids: Asteroid[] = [];
    private kamikazes: Kamikaze[] = [];
    private gunners: Gunner[] = [];
    private leapers: Leaper[] = [];

    // Timers for spawning
    private asteroidTimer!: Phaser.Time.TimerEvent;
    private kamikazeTimer!: Phaser.Time.TimerEvent;
    private gunnerTimer!: Phaser.Time.TimerEvent;
    private leaperTimer!: Phaser.Time.TimerEvent;

    // Current wave for wave-based spawning
    private currentWave: number = 1;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    // Set audio manager for sound effects
    setAudioManager(audioManager: AudioManager): void {
        this.audioManager = audioManager;

        // Set audio manager for all gunners
        this.gunners.forEach((gunner) => {
            gunner.setAudioManager(audioManager);
        });
    }

    // Set explosion manager for visual effects
    setExplosionManager(explosionManager: ExplosionManager): void {
        this.explosionManager = explosionManager;
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
            maxSize: 20,
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
            const gunner = new Gunner(this.scene, this.gunnerGroup, this.enemyBullets);
            if (this.audioManager) {
                gunner.setAudioManager(this.audioManager);
            }
            this.gunners.push(gunner);
        }

        // Initialize leaper pool
        for (let i = 0; i < LEAPER_CONFIG.MAX_POOL_SIZE; i++) {
            this.leapers.push(new Leaper(this.scene, this.leaperGroup));
        }
    }

    private startSpawning(): void {
        // Always spawn asteroids (available from wave 1)
        this.asteroidTimer = this.scene.time.addEvent({
            delay: this.getModifiedSpawnInterval(ASTEROID_CONFIG.SPAWN_INTERVAL),
            callback: this.spawnAsteroid,
            callbackScope: this,
            loop: true,
        });

        // Start leaper spawning from wave 2
        if (this.currentWave >= 2) {
            this.leaperTimer = this.scene.time.addEvent({
                delay: this.getModifiedSpawnInterval(LEAPER_CONFIG.SPAWN_INTERVAL),
                callback: this.spawnLeaper,
                callbackScope: this,
                loop: true,
            });
        }

        // Start kamikaze spawning from wave 3
        if (this.currentWave >= 3) {
            this.kamikazeTimer = this.scene.time.addEvent({
                delay: this.getModifiedSpawnInterval(KAMIKAZE_CONFIG.SPAWN_INTERVAL),
                callback: this.spawnKamikaze,
                callbackScope: this,
                loop: true,
            });
        }

        // Start gunner spawning from wave 4
        if (this.currentWave >= 4) {
            this.gunnerTimer = this.scene.time.addEvent({
                delay: this.getModifiedSpawnInterval(GUNNER_CONFIG.SPAWN_INTERVAL),
                callback: this.spawnGunner,
                callbackScope: this,
                loop: true,
            });
        }
    }

    private spawnAsteroid(): void {
        // Find an inactive asteroid to reuse
        const asteroid = this.asteroids.find((a) => !a.isActive);
        if (asteroid) {
            const y = Phaser.Math.Between(ASTEROID_CONFIG.SPAWN_Y_MIN, ASTEROID_CONFIG.SPAWN_Y_MAX);
            // Let asteroid choose its type randomly based on spawn weights
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
            if (bullet instanceof Phaser.Physics.Arcade.Sprite) {
                // Clean up bullets that are off-screen (left side) or too far right
                if (bullet.active && (bullet.x < -50 || bullet.x > GAME_CONFIG.WIDTH + 100)) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                    if (bullet.body) {
                        bullet.body.enable = false;
                    }
                }

                // Clean up inactive bullets that are still visible (this shouldn't happen but let's be safe)
                if (!bullet.active && bullet.visible) {
                    bullet.setVisible(false);
                    if (bullet.body) {
                        bullet.body.enable = false;
                    }
                }
            }
        });
    }

    // Handle collisions with bullets
    handleBulletCollision(enemy: Phaser.Physics.Arcade.Sprite): number {
        // Check if enemy sprite is still active to prevent multiple hits
        if (!enemy.active) {
            return 0;
        }

        // Find which enemy was hit and deal damage
        let scoreValue = 0;

        // Check asteroids
        for (const asteroid of this.asteroids) {
            if (asteroid.isActive && asteroid.sprite === enemy) {
                // Save position BEFORE calling takeDamage (which may move the enemy)
                const explosionX = enemy.x;
                const explosionY = enemy.y;

                const destroyed = asteroid.takeDamage(BULLET_CONFIG.DAMAGE);

                if (destroyed) {
                    scoreValue = asteroid.scoreValue;
                    // Create explosion effect when enemy is destroyed (using saved position)
                    if (this.explosionManager) {
                        // Use different explosion sizes based on asteroid type
                        const asteroidType = asteroid.getType();
                        if (asteroidType === 'large') {
                            this.explosionManager.explodeMedium(explosionX, explosionY);
                        } else {
                            this.explosionManager.explodeSmall(explosionX, explosionY);
                        }
                    }
                    // Play full explosion sound on destroy
                    if (this.audioManager) {
                        this.audioManager.playExplosionSound(); // Full volume for destruction
                    }
                } else {
                    // Play hit sound only if enemy is not destroyed (quieter volume)
                    if (this.audioManager) {
                        this.audioManager.playExplosionSound(0.3); // 30% volume for hit sound
                    }
                }
                return scoreValue; // Return immediately after processing hit
            }
        }

        // Check kamikazes
        for (const kamikaze of this.kamikazes) {
            if (kamikaze.isActive && kamikaze.sprite === enemy) {
                // Save position BEFORE calling takeDamage (which may move the enemy)
                const explosionX = enemy.x;
                const explosionY = enemy.y;

                const destroyed = kamikaze.takeDamage(BULLET_CONFIG.DAMAGE);

                if (destroyed) {
                    scoreValue = kamikaze.scoreValue;
                    // Create explosion effect when enemy is destroyed (using saved position)
                    if (this.explosionManager) {
                        // Use different explosion sizes based on kamikaze type
                        const kamikazeType = kamikaze.getType();
                        if (kamikazeType === 'fast') {
                            this.explosionManager.explodeSmall(explosionX, explosionY);
                        } else {
                            this.explosionManager.explodeMedium(explosionX, explosionY);
                        }
                    }
                    // Play full explosion sound on destroy
                    if (this.audioManager) {
                        this.audioManager.playExplosionSound(); // Full volume for destruction
                    }
                } else {
                    // Play hit sound only if enemy is not destroyed (quieter volume)
                    if (this.audioManager) {
                        this.audioManager.playExplosionSound(0.3); // 30% volume for hit sound
                    }
                }
                return scoreValue; // Return immediately after processing hit
            }
        }

        // Check gunners
        for (const gunner of this.gunners) {
            if (gunner.isActive && gunner.sprite === enemy) {
                // Save position BEFORE calling takeDamage (which may move the enemy)
                const explosionX = enemy.x;
                const explosionY = enemy.y;

                const destroyed = gunner.takeDamage(BULLET_CONFIG.DAMAGE);

                if (destroyed) {
                    scoreValue = gunner.scoreValue;
                    // Create explosion effect when enemy is destroyed (using saved position)
                    if (this.explosionManager) {
                        // Use different explosion sizes based on gunner type
                        const gunnerType = gunner.getType();
                        if (gunnerType === 'large') {
                            this.explosionManager.explodeLarge(explosionX, explosionY);
                        } else {
                            this.explosionManager.explodeMedium(explosionX, explosionY);
                        }
                    }
                    // Play full explosion sound on destroy
                    if (this.audioManager) {
                        this.audioManager.playExplosionSound(); // Full volume for destruction
                    }
                } else {
                    // Play hit sound only if enemy is not destroyed (quieter volume)
                    if (this.audioManager) {
                        this.audioManager.playExplosionSound(0.3); // 30% volume for hit sound
                    }
                }
                return scoreValue; // Return immediately after processing hit
            }
        }

        // Check leapers
        for (const leaper of this.leapers) {
            if (leaper.isActive && leaper.sprite === enemy) {
                // Save position BEFORE calling takeDamage (which may move the enemy)
                const explosionX = enemy.x;
                const explosionY = enemy.y;

                const destroyed = leaper.takeDamage(BULLET_CONFIG.DAMAGE);

                if (destroyed) {
                    scoreValue = leaper.scoreValue;
                    // Create explosion effect when enemy is destroyed (using saved position)
                    if (this.explosionManager) {
                        this.explosionManager.explodeLarge(explosionX, explosionY);
                    }
                    // Play full explosion sound on destroy
                    if (this.audioManager) {
                        this.audioManager.playExplosionSound(); // Full volume for destruction
                    }
                } else {
                    // Play hit sound only if enemy is not destroyed (quieter volume)
                    if (this.audioManager) {
                        this.audioManager.playExplosionSound(0.3); // 30% volume for hit sound
                    }
                }
                return scoreValue; // Return immediately after processing hit
            }
        }

        return scoreValue;
    }

    // Get groups for collision detection
    getAsteroidGroup(): Phaser.Physics.Arcade.Group {
        return this.asteroidGroup;
    }

    getAsteroids(): Asteroid[] {
        return this.asteroids;
    }

    getKamikazeGroup(): Phaser.Physics.Arcade.Group {
        return this.kamikazeGroup;
    }

    getKamikazes(): Kamikaze[] {
        return this.kamikazes;
    }

    getGunnerGroup(): Phaser.Physics.Arcade.Group {
        return this.gunnerGroup;
    }

    getGunners(): Gunner[] {
        return this.gunners;
    }

    getLeaperGroup(): Phaser.Physics.Arcade.Group {
        return this.leaperGroup;
    }

    getLeapers(): Leaper[] {
        return this.leapers;
    }

    getEnemyBullets(): Phaser.Physics.Arcade.Group {
        return this.enemyBullets;
    }

    // Pause spawning (for pause state)
    pauseSpawning(): void {
        if (this.asteroidTimer) {
            this.asteroidTimer.paused = true;
        }
        if (this.kamikazeTimer) {
            this.kamikazeTimer.paused = true;
        }
        if (this.gunnerTimer) {
            this.gunnerTimer.paused = true;
        }
        if (this.leaperTimer) {
            this.leaperTimer.paused = true;
        }
    }

    // Resume spawning (after pause state)
    resumeSpawning(): void {
        if (this.asteroidTimer) {
            this.asteroidTimer.paused = false;
        }
        if (this.kamikazeTimer) {
            this.kamikazeTimer.paused = false;
        }
        if (this.gunnerTimer) {
            this.gunnerTimer.paused = false;
        }
        if (this.leaperTimer) {
            this.leaperTimer.paused = false;
        }
    }

    // Restart spawning (after stop spawning - recreates timers based on current wave)
    restartSpawning(): void {
        this.startSpawning();
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

    // Set current wave for wave-based enemy spawning
    setCurrentWave(wave: number): void {
        this.currentWave = wave;
    }

    // Get spawn interval with wave-based frequency modifier
    private getModifiedSpawnInterval(baseInterval: number): number {
        const modifier = WAVE_MODIFIERS[this.currentWave as keyof typeof WAVE_MODIFIERS] || 1.0;
        // Higher modifier = more frequent spawning = shorter interval
        const modifiedInterval = Math.round(baseInterval / modifier);

        // Debug: Log spawn frequency changes for waves 5+
        if (this.currentWave >= 5 && modifier > 1.0) {
            console.log(
                `Wave ${this.currentWave}: Spawn frequency increased by ${Math.round((modifier - 1) * 100)}% (${baseInterval}ms -> ${modifiedInterval}ms)`
            );
        }

        return modifiedInterval;
    }
}
