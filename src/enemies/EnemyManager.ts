import { Asteroid } from './Asteroid';
import { Kamikaze } from './Kamikaze';
import { Gunner } from './Gunner';
import { Leaper } from './Leaper';
import { Mothership } from './Mothership';
import { Enemy } from './Enemy';
import {
    ASTEROID_CONFIG,
    KAMIKAZE_CONFIG,
    GUNNER_CONFIG,
    LEAPER_CONFIG,
    GAME_CONFIG,
    BULLET_CONFIG,
    WAVE_MODIFIERS,
    DEPTH_CONFIG,
} from '../config/constants';
import { AudioManager } from '../AudioManager';
import { ExplosionManager } from '../ExplosionManager';
import { Player } from '../Player';
import { UpgradeManager } from '../UpgradeManager';

export class EnemyManager {
    // Asset loading
    static preload(scene: Phaser.Scene): void {
        Asteroid.preload(scene);
        Kamikaze.preload(scene);
        Gunner.preload(scene);
        Leaper.preload(scene);
        Mothership.preload(scene);
    }

    private scene: Phaser.Scene;
    private asteroidGroup!: Phaser.Physics.Arcade.Group;
    private kamikazeGroup!: Phaser.Physics.Arcade.Group;
    private gunnerGroup!: Phaser.Physics.Arcade.Group;
    private leaperGroup!: Phaser.Physics.Arcade.Group;
    private mothershipGroup!: Phaser.Physics.Arcade.Group;
    private enemyBullets!: Phaser.Physics.Arcade.Group;
    private audioManager?: AudioManager;
    private explosionManager?: ExplosionManager;
    private player?: Player;
    private upgradeManager?: UpgradeManager;

    private asteroids: Asteroid[] = [];
    private kamikazes: Kamikaze[] = [];
    private gunners: Gunner[] = [];
    private leapers: Leaper[] = [];
    private mothership?: Mothership;

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

    // Set player reference for Energy Siphon healing
    setPlayer(player: Player): void {
        this.player = player;
    }

    // Set upgrade manager for acid bullets and other upgrade effects
    setUpgradeManager(upgradeManager: UpgradeManager): void {
        this.upgradeManager = upgradeManager;
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

        this.mothershipGroup = this.scene.physics.add.group({
            defaultKey: 'mothership',
            maxSize: 1, // Only one boss at a time
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

        // Initialize mothership (boss)
        this.mothership = new Mothership(this.scene, this.mothershipGroup, this.enemyBullets);
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

        // Update mothership if active
        if (this.mothership && this.mothership.isActive) {
            this.mothership.update(playerX, playerY);
        }

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
    handleBulletCollision(
        enemy: Phaser.Physics.Arcade.Sprite,
        bulletDamage: number = BULLET_CONFIG.BASE_DAMAGE
    ): number {
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

                const destroyed = asteroid.takeDamage(bulletDamage);

                // Apply acid effect if player has the upgrade and enemy wasn't destroyed
                if (!destroyed && this.upgradeManager && this.upgradeManager.hasAcidBullets()) {
                    asteroid.applyAcidEffect(BULLET_CONFIG.BASE_DAMAGE, (enemy, x, y) => this.handleAcidDeath(enemy, x, y));
                }

                if (destroyed) {
                    scoreValue = asteroid.scoreValue;
                    // Trigger Energy Siphon healing if player has the upgrade
                    if (this.player) {
                        this.player.onEnemyKilled(asteroid.maxHP);
                    }
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

                const destroyed = kamikaze.takeDamage(bulletDamage);

                // Apply acid effect if player has the upgrade and enemy wasn't destroyed
                if (!destroyed && this.upgradeManager && this.upgradeManager.hasAcidBullets()) {
                    kamikaze.applyAcidEffect(BULLET_CONFIG.BASE_DAMAGE, (enemy, x, y) => this.handleAcidDeath(enemy, x, y));
                }

                if (destroyed) {
                    scoreValue = kamikaze.scoreValue;
                    // Trigger Energy Siphon healing if player has the upgrade
                    if (this.player) {
                        this.player.onEnemyKilled(kamikaze.maxHP);
                    }
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

                const destroyed = gunner.takeDamage(bulletDamage);

                // Apply acid effect if player has the upgrade and enemy wasn't destroyed
                if (!destroyed && this.upgradeManager && this.upgradeManager.hasAcidBullets()) {
                    gunner.applyAcidEffect(BULLET_CONFIG.BASE_DAMAGE, (enemy, x, y) => this.handleAcidDeath(enemy, x, y));
                }

                if (destroyed) {
                    scoreValue = gunner.scoreValue;
                    // Trigger Energy Siphon healing if player has the upgrade
                    if (this.player) {
                        this.player.onEnemyKilled(gunner.maxHP);
                    }
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

                const destroyed = leaper.takeDamage(bulletDamage);

                // Apply acid effect if player has the upgrade and enemy wasn't destroyed
                if (!destroyed && this.upgradeManager && this.upgradeManager.hasAcidBullets()) {
                    leaper.applyAcidEffect(BULLET_CONFIG.BASE_DAMAGE, (enemy, x, y) => this.handleAcidDeath(enemy, x, y));
                }

                if (destroyed) {
                    scoreValue = leaper.scoreValue;
                    // Trigger Energy Siphon healing if player has the upgrade
                    if (this.player) {
                        this.player.onEnemyKilled(leaper.maxHP);
                    }
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

        // Check mothership (boss)
        if (this.mothership && this.mothership.isActive && this.mothership.sprite === enemy) {
            // Save position BEFORE calling takeDamage (which may move the enemy)
            const explosionX = enemy.x;
            const explosionY = enemy.y;

            const destroyed = this.mothership.takeDamage(bulletDamage);

            // Boss is immune to acid effects - no acid damage applied

            if (destroyed) {
                scoreValue = this.mothership.scoreValue;
                // Trigger Energy Siphon healing if player has the upgrade
                if (this.player) {
                    this.player.onEnemyKilled(this.mothership.maxHP);
                }
                // Create massive explosion effect when boss is destroyed (using saved position)
                if (this.explosionManager) {
                    // Multiple large explosions for epic boss death
                    this.explosionManager.explodeLarge(explosionX, explosionY);
                    // Additional explosions with slight delay for dramatic effect
                    setTimeout(() => {
                        if (this.explosionManager) {
                            this.explosionManager.explodeLarge(explosionX - 50, explosionY - 30);
                            this.explosionManager.explodeLarge(explosionX + 50, explosionY + 30);
                        }
                    }, 200);
                }
                // Play full explosion sound on destroy
                if (this.audioManager) {
                    this.audioManager.playExplosionSound(); // Full volume for boss destruction
                }
            } else {
                // Play hit sound only if boss is not destroyed (moderate volume)
                if (this.audioManager) {
                    this.audioManager.playExplosionSound(0.4); // 40% volume for boss hit sound
                }
            }
            return scoreValue; // Return immediately after processing hit
        }

        return scoreValue;
    }

    // Handle enemy death from acid damage
    private handleAcidDeath(enemy: Enemy, explosionX: number, explosionY: number): void {
        // Use the provided explosion coordinates (saved before enemy was moved off-screen)
        // If coordinates are undefined, skip explosion (this shouldn't happen but let's be safe)
        if (explosionX === undefined || explosionY === undefined) {
            console.warn('[ACID_DEATH] Invalid explosion coordinates, skipping explosion');
            return;
        }

        // Trigger Energy Siphon healing if player has the upgrade
        if (this.player) {
            this.player.onEnemyKilled(enemy.maxHP);
        }

        // Create explosion effect based on enemy type
        if (this.explosionManager) {
            // Check enemy type and create appropriate explosion
            if (this.asteroids.includes(enemy as any)) {
                const asteroid = enemy as any;
                const asteroidType = asteroid.getType();
                if (asteroidType === 'large') {
                    this.explosionManager.explodeMedium(explosionX, explosionY);
                } else {
                    this.explosionManager.explodeSmall(explosionX, explosionY);
                }
            } else if (this.kamikazes.includes(enemy as any)) {
                const kamikaze = enemy as any;
                const kamikazeType = kamikaze.getType();
                if (kamikazeType === 'fast') {
                    this.explosionManager.explodeSmall(explosionX, explosionY);
                } else {
                    this.explosionManager.explodeMedium(explosionX, explosionY);
                }
            } else if (this.gunners.includes(enemy as any)) {
                const gunner = enemy as any;
                const gunnerType = gunner.getType();
                if (gunnerType === 'large') {
                    this.explosionManager.explodeLarge(explosionX, explosionY);
                } else {
                    this.explosionManager.explodeMedium(explosionX, explosionY);
                }
            } else if (this.leapers.includes(enemy as any)) {
                this.explosionManager.explodeLarge(explosionX, explosionY);
            }
        }

        // Play explosion sound
        if (this.audioManager) {
            this.audioManager.playExplosionSound();
        }
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

    getMothershipGroup(): Phaser.Physics.Arcade.Group {
        return this.mothershipGroup;
    }

    getMothership(): Mothership | undefined {
        return this.mothership;
    }

    // Spawn the boss for wave 8
    spawnMothership(playerX: number, playerY: number): void {
        if (this.mothership && !this.mothership.isActive) {
            // Spawn slightly right of center
            const spawnX = GAME_CONFIG.WIDTH * 0.6; // 60% of screen width (768px for 1280px screen)
            const spawnY = GAME_CONFIG.HEIGHT / 2; // Center vertically
            this.mothership.spawn(spawnX, spawnY);
            
            // Set proper depths for all enemy types to maintain visual hierarchy
            this.asteroidGroup.setDepth(DEPTH_CONFIG.ASTEROIDS);
            this.kamikazeGroup.setDepth(DEPTH_CONFIG.KAMIKAZES);
            this.gunnerGroup.setDepth(DEPTH_CONFIG.GUNNERS);
            this.leaperGroup.setDepth(DEPTH_CONFIG.LEAPERS);
            
            console.log('[BOSS] Mothership spawned for final wave');
        }
    }

    // Check if boss is defeated
    isBossDefeated(): boolean {
        const defeated = !this.mothership || !this.mothership.isActive;
        if (this.currentWave === 8) {
            console.log(`[BOSS_CHECK] Boss defeated: ${defeated}, mothership exists: ${!!this.mothership}, mothership active: ${this.mothership?.isActive}`);
        }
        return defeated;
    }

    // Get boss HP for UI display
    getBossHP(): { current: number; max: number } | null {
        if (this.mothership && this.mothership.isActive) {
            return {
                current: this.mothership.currentHP,
                max: this.mothership.maxHP
            };
        }
        return null;
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

    // Pause all acid effects (for pause state)
    pauseAcidEffects(): void {
        // Pause acid effects on all active enemies
        this.asteroids.forEach(enemy => {
            if (enemy.isActive) {
                enemy.pauseAcidEffects();
            }
        });
        this.kamikazes.forEach(enemy => {
            if (enemy.isActive) {
                enemy.pauseAcidEffects();
            }
        });
        this.gunners.forEach(enemy => {
            if (enemy.isActive) {
                enemy.pauseAcidEffects();
            }
        });
        this.leapers.forEach(enemy => {
            if (enemy.isActive) {
                enemy.pauseAcidEffects();
            }
        });
        
        // Pause acid effects on boss
        if (this.mothership && this.mothership.isActive) {
            this.mothership.pauseAcidEffects();
        }
    }

    // Resume all acid effects (after pause state)
    resumeAcidEffects(): void {
        // Resume acid effects on all active enemies
        this.asteroids.forEach(enemy => {
            if (enemy.isActive) {
                enemy.resumeAcidEffects();
            }
        });
        this.kamikazes.forEach(enemy => {
            if (enemy.isActive) {
                enemy.resumeAcidEffects();
            }
        });
        this.gunners.forEach(enemy => {
            if (enemy.isActive) {
                enemy.resumeAcidEffects();
            }
        });
        this.leapers.forEach(enemy => {
            if (enemy.isActive) {
                enemy.resumeAcidEffects();
            }
        });
        
        // Resume acid effects on boss
        if (this.mothership && this.mothership.isActive) {
            this.mothership.resumeAcidEffects();
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
        
        // Reset boss
        if (this.mothership) {
            this.mothership.reset();
        }

        // Reset enemy bullets
        this.enemyBullets.clear(true, true);
    }

    destroy(): void {
        this.stopSpawning();
        this.asteroids.forEach((asteroid) => asteroid.destroy());
        this.kamikazes.forEach((kamikaze) => kamikaze.destroy());
        this.gunners.forEach((gunner) => gunner.destroy());
        this.leapers.forEach((leaper) => leaper.destroy());
        
        // Destroy boss
        if (this.mothership) {
            this.mothership.destroy();
            this.mothership = undefined;
        }
        
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
