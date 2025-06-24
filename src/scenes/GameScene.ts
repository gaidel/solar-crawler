import {
    BULLET_CONFIG,
    GAME_CONFIG,
    DAMAGE_CONFIG,
    UPGRADE_CONFIG,
    DEPTH_CONFIG,
} from '../config/constants';
import { Player } from '../Player';
import { GameUI, GameState } from '../GameUI';
import { EnemyManager } from '../enemies/EnemyManager';
import { AudioManager } from '../AudioManager';
import { ExplosionManager } from '../ExplosionManager';
import { UpgradeManager } from '../UpgradeManager';

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private gameUI!: GameUI;
    private enemyManager!: EnemyManager;
    private explosionManager!: ExplosionManager;
    private bullets!: Phaser.Physics.Arcade.Group;
    private audioManager!: AudioManager;
    private upgradeManager!: UpgradeManager;
    private background!: Phaser.GameObjects.TileSprite;

    // Game state
    private gameState: GameState = GameState.PLAYING;
    private startTime: number = 0;
    private score: number = 0;
    private currentWave: number = 1;
    private waveStartTime: number = 0;

    // Debug/Cheat keys (only work when debug mode is enabled)
    private vKey?: Phaser.Input.Keyboard.Key;
    private hKey?: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load scene-specific assets
        this.load.image('background', 'assets/images/background.png');

        // Load assets for game entities
        Player.preload(this);
        EnemyManager.preload(this);
        ExplosionManager.preload(this);
        UpgradeManager.preload(this);

        // Load audio assets
        AudioManager.preload(this);
    }

    create() {
        // Initialize game state
        this.gameState = GameState.PLAYING;
        this.startTime = this.time.now;
        this.score = 0;
        this.currentWave = 1;
        this.waveStartTime = this.time.now;

        // Initialize audio manager and start game music
        this.audioManager = new AudioManager(this);
        this.audioManager.playGameMusic();

        // Initialize upgrade manager
        this.upgradeManager = new UpgradeManager();

        // Add background
        this.background = this.add.tileSprite(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            'background'
        );
        this.background.setScrollFactor(0);
        this.background.setDepth(DEPTH_CONFIG.BACKGROUND);

        // Create bullets group first
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: BULLET_CONFIG.MAX_POOL_SIZE,
            runChildUpdate: true,
        });

        // Create player
        this.player = new Player(this);
        this.player.create(this.bullets);
        this.player.setAudioManager(this.audioManager);
        this.player.setUpgradeManager(this.upgradeManager);

        // Create UI system
        this.gameUI = new GameUI(this);
        this.gameUI.create();
        this.gameUI.setAudioManager(this.audioManager);

        // Create enemy management system
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.setAudioManager(this.audioManager);
        this.enemyManager.setCurrentWave(this.currentWave);
        this.enemyManager.setPlayer(this.player); // Connect player for Energy Siphon
        this.enemyManager.setUpgradeManager(this.upgradeManager); // Connect upgrade manager for acid bullets
        this.enemyManager.create();

        // Create explosion manager
        this.explosionManager = new ExplosionManager(this);
        this.explosionManager.create();

        // Connect explosion manager to enemy manager
        this.enemyManager.setExplosionManager(this.explosionManager);

        // Set up collisions
        this.setupCollisions();

        // Set up debug cheats (only when debug mode is enabled)
        this.setupDebugCheats();

        // Set up cleanup when scene is destroyed
        this.events.once('shutdown', this.cleanup, this);
        this.events.once('destroy', this.cleanup, this);
    }

    private setupCollisions(): void {
        // Player bullets vs All enemy types (using overlap to avoid physics collision)
        this.physics.add.overlap(
            this.bullets,
            this.enemyManager.getAsteroidGroup(),
            (bullet, enemy) =>
                this.handleEnemyHit(
                    bullet as Phaser.Physics.Arcade.Sprite,
                    enemy as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );

        this.physics.add.overlap(
            this.bullets,
            this.enemyManager.getKamikazeGroup(),
            (bullet, enemy) =>
                this.handleEnemyHit(
                    bullet as Phaser.Physics.Arcade.Sprite,
                    enemy as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );

        this.physics.add.overlap(
            this.bullets,
            this.enemyManager.getGunnerGroup(),
            (bullet, enemy) =>
                this.handleEnemyHit(
                    bullet as Phaser.Physics.Arcade.Sprite,
                    enemy as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );

        this.physics.add.overlap(
            this.bullets,
            this.enemyManager.getLeaperGroup(),
            (bullet, enemy) =>
                this.handleEnemyHit(
                    bullet as Phaser.Physics.Arcade.Sprite,
                    enemy as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );

        this.physics.add.overlap(
            this.bullets,
            this.enemyManager.getMothershipGroup(),
            (bullet, enemy) =>
                this.handleEnemyHit(
                    bullet as Phaser.Physics.Arcade.Sprite,
                    enemy as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );

        // Player vs All enemy types (using overlap to prevent physics momentum)
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyManager.getAsteroidGroup(),
            (player, enemy) =>
                this.handlePlayerAsteroidCollision(
                    player as Phaser.Physics.Arcade.Sprite,
                    enemy as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyManager.getKamikazeGroup(),
            (player, enemy) =>
                this.handlePlayerKamikazeCollision(
                    player as Phaser.Physics.Arcade.Sprite,
                    enemy as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyManager.getGunnerGroup(),
            (player, enemy) =>
                this.handlePlayerGunnerCollision(
                    player as Phaser.Physics.Arcade.Sprite,
                    enemy as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyManager.getLeaperGroup(),
            (player, enemy) =>
                this.handlePlayerLeaperCollision(
                    player as Phaser.Physics.Arcade.Sprite,
                    enemy as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );

        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyManager.getMothershipGroup(),
            (player, enemy) =>
                this.handlePlayerMothershipCollision(
                    player as Phaser.Physics.Arcade.Sprite,
                    enemy as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );

        // Player vs Enemy bullets
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyManager.getEnemyBullets(),
            (player, bullet) =>
                this.handlePlayerBulletCollision(
                    player as Phaser.Physics.Arcade.Sprite,
                    bullet as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );

        // Player bullets vs Enemy bullets (Interceptor upgrade)
        this.physics.add.overlap(
            this.bullets,
            this.enemyManager.getEnemyBullets(),
            (playerBullet, enemyBullet) =>
                this.handleBulletInterception(
                    playerBullet as Phaser.Physics.Arcade.Sprite,
                    enemyBullet as Phaser.Physics.Arcade.Sprite
                ),
            // Process callback - only if player has Interceptor upgrade
            (_playerBullet, _enemyBullet) => {
                return this.upgradeManager ? this.upgradeManager.hasInterceptor() : false;
            },
            this
        );
    }

    update() {
        // Update UI (handles menu navigation in game over/victory states)
        this.gameUI.update();

        // Check for pause input during gameplay
        if (this.gameState === GameState.PLAYING && this.gameUI.isPausePressed()) {
            this.pauseGame();
            return;
        }

        // Stop updating if game is not active
        if (this.gameState !== GameState.PLAYING) {
            return;
        }

        // Check for victory condition
        const waveElapsedTime = this.time.now - this.waveStartTime;

        // Wave 8 - Boss wave, no timer, victory only on boss defeat
        if (this.currentWave === 8) {
            if (this.enemyManager.isBossDefeated()) {
                this.completeWave();
                return;
            }
        } else {
            // Regular waves - timer-based victory
            if (waveElapsedTime >= GAME_CONFIG.WAVE_DURATION) {
                this.completeWave();
                return;
            }
        }

        // Update background
        if (this.background) {
            this.background.tilePositionX += GAME_CONFIG.BACKGROUND_SCROLL_SPEED;
        }

        // Get input from UI and update player
        const playerInput = this.gameUI.getPlayerInput();
        this.player.update(this.time.now, playerInput);

        // Update enemy manager with player position
        this.enemyManager.update(this.player.getX(), this.player.getY());

        // Update HUD with wave information
        if (this.currentWave === 8) {
            // Boss wave - show boss HP instead of timer
            const bossHP = this.enemyManager.getBossHP();
            this.gameUI.updateHUDWithBossHP(
                this.score,
                this.currentWave,
                GAME_CONFIG.TOTAL_WAVES,
                bossHP
            );
        } else {
            // Regular waves - show timer
            const waveTimeLeft = Math.max(0, GAME_CONFIG.WAVE_DURATION - waveElapsedTime);
            this.gameUI.updateHUD(
                this.score,
                waveTimeLeft,
                this.currentWave,
                GAME_CONFIG.TOTAL_WAVES
            );
        }

        // Update player HP display
        this.gameUI.updatePlayerHP(this.player.getCurrentHP(), this.player.getMaxHP());

        // Check for debug cheats
        this.handleDebugCheats();

        // Clean up bullets
        this.cleanupBullets();

        // Force cleanup of enemy bullets to prevent stuck bullets
        // this.enemyManager.forceCleanupBullets();
    }

    private cleanupBullets(): void {
        this.bullets.getChildren().forEach((bullet) => {
            if (
                bullet instanceof Phaser.Physics.Arcade.Sprite &&
                bullet.active &&
                bullet.x > GAME_CONFIG.WIDTH
            ) {
                bullet.setActive(false);
                bullet.setVisible(false);

                // Disable physics body to prevent further collisions
                if (bullet.body) {
                    bullet.body.enable = false;
                }
            }
        });
    }

    private clearAllPlayerBullets(): void {
        // Clear all active player bullets when transitioning between waves
        this.bullets.getChildren().forEach((bullet) => {
            if (bullet instanceof Phaser.Physics.Arcade.Sprite && bullet.active) {
                bullet.setActive(false);
                bullet.setVisible(false);

                // Disable physics body to prevent further collisions
                if (bullet.body) {
                    bullet.body.enable = false;
                }
            }
        });
    }

    private handleEnemyHit(
        bullet: Phaser.Physics.Arcade.Sprite,
        enemy: Phaser.Physics.Arcade.Sprite
    ): void {
        // Check if bullet is already processed (prevent multiple hits)
        if (!bullet.active) {
            return;
        }

        // Store bullet position for potential AOE explosion
        const impactX = bullet.x;
        const impactY = bullet.y;

        // Properly deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);

        // Disable physics body to prevent further collisions
        if (bullet.body) {
            bullet.body.enable = false;
        }

        // Handle enemy hit and get score value
        const bulletDamage = this.player.getBulletDamage();
        const scoreValue = this.enemyManager.handleBulletCollision(enemy, bulletDamage);
        this.score += scoreValue;

        // Check for AOE damage upgrade
        if (this.upgradeManager && this.upgradeManager.hasAOEBullets()) {
            this.handleAOEExplosion(impactX, impactY, bulletDamage);
        }
    }

    private handlePlayerAsteroidCollision(
        playerSprite: Phaser.Physics.Arcade.Sprite,
        enemySprite: Phaser.Physics.Arcade.Sprite
    ): void {
        // Check if enemy is already inactive
        if (!enemySprite.active) {
            return;
        }

        // Find the asteroid object to get its collision damage
        const asteroid = this.enemyManager.getAsteroids().find((a) => a.sprite === enemySprite);
        if (!asteroid) {
            return;
        }

        // Player takes damage based on asteroid type
        const damage = asteroid.getCollisionDamage();
        const playerDestroyed = this.player.takeDamage(damage);

        // Play hit sound
        if (this.audioManager) {
            this.audioManager.playExplosionSound(0.4); // 40% volume for player hit
        }

        // Properly destroy the asteroid using its onHit method
        // This ensures health bar is properly cleaned up
        asteroid.onHit();

        // Create explosion at enemy position - size based on asteroid type
        if (this.explosionManager) {
            const asteroidType = asteroid.getType();
            if (asteroidType === 'large') {
                this.explosionManager.explodeMedium(enemySprite.x, enemySprite.y);
            } else {
                this.explosionManager.explodeSmall(enemySprite.x, enemySprite.y);
            }
        }

        if (playerDestroyed) {
            this.gameOver();
        }
    }

    private handlePlayerKamikazeCollision(
        playerSprite: Phaser.Physics.Arcade.Sprite,
        enemySprite: Phaser.Physics.Arcade.Sprite
    ): void {
        // Check if enemy is already inactive
        if (!enemySprite.active) {
            return;
        }

        // Find the kamikaze object to get its collision damage
        const kamikaze = this.enemyManager.getKamikazes().find((k) => k.sprite === enemySprite);
        if (!kamikaze) {
            return;
        }

        // Player takes damage based on kamikaze type
        const damage = kamikaze.getCollisionDamage();
        const playerDestroyed = this.player.takeDamage(damage);

        // Play hit sound
        if (this.audioManager) {
            this.audioManager.playExplosionSound(0.4); // 40% volume for player hit
        }

        // Properly destroy the kamikaze using its onHit method
        // This ensures health bar is properly cleaned up
        kamikaze.onHit();

        // Create explosion at enemy position - size based on kamikaze type
        if (this.explosionManager) {
            const kamikazeType = kamikaze.getType();
            if (kamikazeType === 'fast') {
                this.explosionManager.explodeSmall(enemySprite.x, enemySprite.y);
            } else {
                this.explosionManager.explodeMedium(enemySprite.x, enemySprite.y);
            }
        }

        if (playerDestroyed) {
            this.gameOver();
        }
    }

    private handlePlayerLeaperCollision(
        playerSprite: Phaser.Physics.Arcade.Sprite,
        enemySprite: Phaser.Physics.Arcade.Sprite
    ): void {
        // Check if enemy is already inactive
        if (!enemySprite.active) {
            return;
        }

        // Find the leaper object to get its collision damage
        const leaper = this.enemyManager.getLeapers().find((l) => l.sprite === enemySprite);
        if (!leaper) {
            return;
        }

        // Player takes damage based on leaper type
        const damage = leaper.getCollisionDamage();
        const playerDestroyed = this.player.takeDamage(damage);

        // Play hit sound
        if (this.audioManager) {
            this.audioManager.playExplosionSound(0.4); // 40% volume for player hit
        }

        // Properly destroy the leaper using its onHit method
        // This ensures health bar is properly cleaned up
        leaper.onHit();

        // Create explosion at enemy position - size based on leaper type
        if (this.explosionManager) {
            // All leaper types are the same size, so use large explosion
            this.explosionManager.explodeLarge(enemySprite.x, enemySprite.y);
        }

        if (playerDestroyed) {
            this.gameOver();
        }
    }

    private handlePlayerMothershipCollision(
        playerSprite: Phaser.Physics.Arcade.Sprite,
        enemySprite: Phaser.Physics.Arcade.Sprite
    ): void {
        // Check if enemy is already inactive
        if (!enemySprite.active) {
            return;
        }

        // Boss contact damage (very high)
        const damage = 75;
        const playerDestroyed = this.player.takeDamage(damage);

        // Play hit sound
        if (this.audioManager) {
            this.audioManager.playExplosionSound(0.6); // 60% volume for boss hit
        }

        // Boss doesn't get destroyed by player contact - it's too big!
        // Create explosion at contact point instead
        if (this.explosionManager) {
            this.explosionManager.explodeMedium(playerSprite.x, playerSprite.y);
        }

        if (playerDestroyed) {
            this.gameOver();
        }
    }

    private handlePlayerEnemyCollision(
        playerSprite: Phaser.Physics.Arcade.Sprite,
        enemySprite: Phaser.Physics.Arcade.Sprite,
        damage: number
    ): void {
        // Check if enemy is already inactive
        if (!enemySprite.active) {
            return;
        }

        // Player takes damage
        const playerDestroyed = this.player.takeDamage(damage);

        // Play hit sound
        if (this.audioManager) {
            this.audioManager.playExplosionSound(0.4); // 40% volume for player hit
        }

        // Destroy the enemy (except for bullets)
        enemySprite.setActive(false);
        enemySprite.setVisible(false);

        // Create small explosion at enemy position
        if (this.explosionManager) {
            this.explosionManager.explodeSmall(enemySprite.x, enemySprite.y);
        }

        if (playerDestroyed) {
            this.gameOver();
        }
    }

    private handlePlayerBulletCollision(
        playerSprite: Phaser.Physics.Arcade.Sprite,
        bulletSprite: Phaser.Physics.Arcade.Sprite
    ): void {
        // Check if bullet is already inactive
        if (!bulletSprite.active) {
            return;
        }

        // Player takes damage from enemy bullet
        const playerDestroyed = this.player.takeDamage(DAMAGE_CONFIG.ENEMY_BULLET);

        // Play hit sound
        if (this.audioManager) {
            this.audioManager.playExplosionSound(0.4); // 40% volume for player hit
        }

        // Properly destroy the bullet (simple approach)
        bulletSprite.setActive(false);
        bulletSprite.setVisible(false);

        // Disable physics body
        if (bulletSprite.body) {
            bulletSprite.body.enable = false;
        }

        if (playerDestroyed) {
            this.gameOver();
        }
    }

    private handleAOEExplosion(x: number, y: number, _bulletDamage: number): void {
        // Create explosion effect at impact point
        if (this.explosionManager) {
            this.explosionManager.explodeMedium(x, y);
        }

        // Play explosion sound with moderate volume
        if (this.audioManager) {
            this.audioManager.playExplosionSound(0.6); // 60% volume for AOE explosion
        }

        // Calculate AOE damage (half of base bullet damage, not current damage)
        const aoeDamage = Math.round(
            BULLET_CONFIG.BASE_DAMAGE * UPGRADE_CONFIG.AOE_DAMAGE_MULTIPLIER
        );
        const aoeRadius = UPGRADE_CONFIG.AOE_RADIUS;

        // Find all active enemies within AOE radius and damage them
        const allEnemyGroups = [
            this.enemyManager.getAsteroidGroup(),
            this.enemyManager.getKamikazeGroup(),
            this.enemyManager.getGunnerGroup(),
            this.enemyManager.getLeaperGroup(),
            this.enemyManager.getMothershipGroup(),
        ];

        allEnemyGroups.forEach((group) => {
            group.getChildren().forEach((enemy) => {
                if (enemy instanceof Phaser.Physics.Arcade.Sprite && enemy.active) {
                    // Calculate distance from explosion center
                    const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);

                    // If enemy is within AOE radius, damage them
                    if (distance <= aoeRadius) {
                        const aoeScoreValue = this.enemyManager.handleBulletCollision(
                            enemy,
                            aoeDamage
                        );
                        this.score += aoeScoreValue;
                    }
                }
            });
        });
    }

    private handleBulletInterception(
        playerBullet: Phaser.Physics.Arcade.Sprite,
        enemyBullet: Phaser.Physics.Arcade.Sprite
    ): void {
        // Check if both bullets are still active
        if (!playerBullet.active || !enemyBullet.active) {
            return;
        }

        // Destroy both bullets
        playerBullet.setActive(false);
        playerBullet.setVisible(false);
        if (playerBullet.body) {
            playerBullet.body.enable = false;
        }

        enemyBullet.setActive(false);
        enemyBullet.setVisible(false);
        if (enemyBullet.body) {
            enemyBullet.body.enable = false;
        }

        // Create small explosion effect at collision point
        const collisionX = (playerBullet.x + enemyBullet.x) / 2;
        const collisionY = (playerBullet.y + enemyBullet.y) / 2;

        if (this.explosionManager) {
            this.explosionManager.explodeSmall(collisionX, collisionY);
        }

        // Play soft explosion sound for bullet interception
        if (this.audioManager) {
            this.audioManager.playExplosionSound(0.2); // 20% volume for bullet collision
        }
    }

    private handlePlayerGunnerCollision(
        playerSprite: Phaser.Physics.Arcade.Sprite,
        enemySprite: Phaser.Physics.Arcade.Sprite
    ): void {
        // Check if enemy is already inactive
        if (!enemySprite.active) {
            return;
        }

        // Find the gunner object to get its collision damage
        const gunner = this.enemyManager.getGunners().find((g) => g.sprite === enemySprite);
        if (!gunner) {
            return;
        }

        // Player takes damage based on gunner type
        const damage = gunner.getCollisionDamage();
        const playerDestroyed = this.player.takeDamage(damage);

        // Play hit sound
        if (this.audioManager) {
            this.audioManager.playExplosionSound(0.4); // 40% volume for player hit
        }

        // Properly destroy the gunner using its onHit method
        // This ensures health bar is properly cleaned up
        gunner.onHit();

        // Create explosion at enemy position - size based on gunner type
        if (this.explosionManager) {
            const gunnerType = gunner.getType();
            if (gunnerType === 'large') {
                this.explosionManager.explodeMedium(enemySprite.x, enemySprite.y);
            } else {
                this.explosionManager.explodeSmall(enemySprite.x, enemySprite.y);
            }
        }

        if (playerDestroyed) {
            this.gameOver();
        }
    }

    private gameOver(): void {
        // Check if player has Rebirth upgrade
        if (this.upgradeManager && this.upgradeManager.hasRebirth()) {
            this.triggerRebirth();
            return;
        }

        // Normal game over
        this.gameState = GameState.GAME_OVER;

        // Update HP display to show 0 HP before showing game over screen
        this.gameUI.updatePlayerHP(this.player.getCurrentHP(), this.player.getMaxHP());

        // Create explosion effect at player position
        if (this.explosionManager) {
            this.explosionManager.explodeLarge(this.player.getX(), this.player.getY());
        }

        // Play explosion sound when player dies
        if (this.audioManager) {
            this.audioManager.playExplosionSound();
        }

        this.gameUI.gameOver(
            this.score,
            (color: number) => this.player.setTint(color),
            () => this.physics.pause(),
            () => this.enemyManager.stopSpawning(),
            () => this.restart(),
            () => this.returnToMenu()
        );
    }

    private triggerRebirth(): void {
        // Change game state to prevent further updates
        this.gameState = GameState.GAME_OVER; // Use GAME_OVER state to stop updates

        // Consume the rebirth upgrade (remove it)
        if (this.upgradeManager) {
            this.upgradeManager.consumeRebirth();
        }

        // Update HP display to show 0 HP
        this.gameUI.updatePlayerHP(this.player.getCurrentHP(), this.player.getMaxHP());

        // Pause physics to prevent movement and collisions
        this.physics.pause();

        // Stop enemy spawning
        this.enemyManager.stopSpawning();

        // Create explosion effect at player position
        if (this.explosionManager) {
            this.explosionManager.explodeLarge(this.player.getX(), this.player.getY());
        }

        // Play explosion sound when player dies
        if (this.audioManager) {
            this.audioManager.playExplosionSound();
        }

        // Show rebirth message and restart current wave
        this.gameUI.showRebirth(
            this.currentWave,
            () => this.restartCurrentWave(),
            () => this.returnToMenu()
        );
    }

    private restartCurrentWave(): void {
        this.gameState = GameState.PLAYING;
        this.waveStartTime = this.time.now;

        // Clear UI overlays and menus
        this.gameUI.hideOverlays();

        // Reset player to full health and position
        this.player.reset();

        // Clear all enemies from screen
        this.enemyManager.reset();

        // Clear all player bullets from previous attempt
        this.clearAllPlayerBullets();

        // Update enemy manager with current wave number (don't increment)
        this.enemyManager.setCurrentWave(this.currentWave);

        // Resume physics
        this.physics.resume();

        // Restart enemy spawning
        this.enemyManager.restartSpawning();

        // Wave 8 - Respawn the boss after rebirth!
        if (this.currentWave === 8) {
            console.log('[REBIRTH] Respawning boss for wave 8 after rebirth');
            this.enemyManager.spawnMothership(this.player.getX(), this.player.getY());
        }

        console.log(`[REBIRTH] Wave ${this.currentWave} restarted`);
    }

    private completeWave(): void {
        if (this.currentWave >= GAME_CONFIG.TOTAL_WAVES) {
            // Final victory after completing all waves
            this.finalVictory();
        } else {
            // Wave completed, start next wave
            this.waveVictory();
        }
    }

    private waveVictory(): void {
        this.gameState = GameState.VICTORY;

        // Update HP bar to show current HP on wave completion screen
        this.gameUI.updatePlayerHP(this.player.getCurrentHP(), this.player.getMaxHP());

        // Pause physics to prevent movement and collisions
        this.physics.pause();

        // Stop enemy spawning
        this.enemyManager.stopSpawning();

        // Show upgrade screen after every wave (except the last one) if upgrades are available
        if (
            this.currentWave < GAME_CONFIG.TOTAL_WAVES &&
            this.upgradeManager.hasAvailableUpgrades()
        ) {
            this.showUpgradeSelectionWithDelayed();
        } else {
            // Show normal wave completion message if no upgrades available or it's the last wave
            this.gameUI.showWaveVictory(
                this.currentWave,
                this.score,
                () => {
                    this.startNextWave();
                },
                () => {
                    this.returnToMenu();
                }
            );
        }
    }

    private finalVictory(): void {
        this.gameState = GameState.VICTORY;

        // Update HP bar to show current HP on final victory screen
        this.gameUI.updatePlayerHP(this.player.getCurrentHP(), this.player.getMaxHP());

        // Pause physics to prevent movement and collisions
        this.physics.pause();

        // Stop enemy spawning
        this.enemyManager.stopSpawning();

        // Show final victory message
        this.gameUI.showFinalVictory(
            this.score,
            () => {
                this.restart();
            },
            () => {
                this.returnToMenu();
            }
        );
    }

    private startNextWave(): void {
        this.currentWave++;
        this.waveStartTime = this.time.now;
        this.gameState = GameState.PLAYING;

        // Clear UI overlays and menus
        this.gameUI.hideOverlays();

        // Reset player position and state (preserve HP between waves)
        this.player.resetPosition();

        // Clear all enemies from screen
        this.enemyManager.reset();

        // Clear all player bullets from previous wave
        this.clearAllPlayerBullets();

        // Update enemy manager with new wave number
        this.enemyManager.setCurrentWave(this.currentWave);

        // Resume physics
        this.physics.resume();

        // Restart enemy spawning (recreate timers based on new wave)
        this.enemyManager.restartSpawning();

        // Wave 8 - Spawn the boss!
        if (this.currentWave === 8) {
            console.log('[BOSS] Starting final boss wave!');
            this.enemyManager.spawnMothership(this.player.getX(), this.player.getY());

            // Switch to epic boss battle music
            if (this.audioManager) {
                this.audioManager.playBossMusic();
            }
        }
    }

    private victory(): void {
        // This method is now only used for backwards compatibility
        // The actual victory logic is handled by completeWave()
        this.finalVictory();
    }

    private restart(): void {
        // Clean up UI screens
        this.gameUI.clearScreens();

        // Stop all audio globally
        AudioManager.stopAllAudio(this);

        // Clean up local audio manager
        if (this.audioManager) {
            this.audioManager.destroy();
        }

        // Reset upgrades
        if (this.upgradeManager) {
            this.upgradeManager.reset();
        }

        // Restart the scene
        this.scene.restart();
    }

    private returnToMenu(): void {
        // Clean up UI screens
        this.gameUI.clearScreens();

        // Stop all audio globally
        AudioManager.stopAllAudio(this);

        // Clean up local audio manager
        if (this.audioManager) {
            this.audioManager.destroy();
        }

        // Reset upgrades
        if (this.upgradeManager) {
            this.upgradeManager.reset();
        }

        // Return to main menu
        this.scene.switch('MainMenuScene');
    }

    private pauseGame(): void {
        this.gameState = GameState.PAUSED;

        // Pause physics
        this.physics.pause();

        // Pause player firing timer
        this.player.pause();

        // Pause enemy spawning
        this.enemyManager.pauseSpawning();

        // Pause acid effects
        this.enemyManager.pauseAcidEffects();

        // Show pause menu
        this.gameUI.showPauseMenu(
            () => this.resumeGame(),
            () => this.returnToMenu()
        );
    }

    private resumeGame(): void {
        this.gameState = GameState.PLAYING;

        // Resume physics
        this.physics.resume();

        // Resume player firing timer
        this.player.resume();

        // Resume enemy spawning
        this.enemyManager.resumeSpawning();

        // Resume acid effects
        this.enemyManager.resumeAcidEffects();

        // Clear any UI overlays
        this.gameUI.clearScreens();
    }

    // Debug/Cheat system
    private setupDebugCheats(): void {
        // Only set up cheats when debug mode is enabled
        if (this.physics.world.debugGraphic) {
            this.vKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.V);
            this.hKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.H);

            console.log('[DEBUG] === Solar Crawler Debug Cheats Enabled ===');
            console.log('[DEBUG] V Key - Skip to 10 seconds remaining in current wave');
            console.log('[DEBUG] H Key - Restore player health to full');
            console.log('[DEBUG] R Key - Reroll upgrade selection (in upgrade screen)');
            console.log('[DEBUG] ============================================');
        }
    }

    private handleDebugCheats(): void {
        // Only process cheats when debug mode is enabled and during gameplay
        if (!this.physics.world.debugGraphic || this.gameState !== GameState.PLAYING) {
            return;
        }

        // V key - Skip to 10 seconds remaining in current wave
        if (this.vKey && Phaser.Input.Keyboard.JustDown(this.vKey)) {
            this.skipToWaveEnd();
        }

        // H key - Restore full health
        if (this.hKey && Phaser.Input.Keyboard.JustDown(this.hKey)) {
            this.restorePlayerHealth();
        }
    }

    private skipToWaveEnd(): void {
        if (this.currentWave === 8) {
            console.log(
                `[CHEAT] Cannot skip Wave 8 - boss must be defeated to complete final wave`
            );
            return;
        }

        const tenSecondsInMs = 10 * 1000;
        const targetWaveTime = GAME_CONFIG.WAVE_DURATION - tenSecondsInMs;
        this.waveStartTime = this.time.now - targetWaveTime;

        console.log(`[CHEAT] Skipped to 10 seconds remaining in wave ${this.currentWave}`);
    }

    private restorePlayerHealth(): void {
        this.player.restoreFullHealth();
    }

    // Upgrade system
    private showUpgradeSelection(): void {
        console.log('[UPGRADE] Showing upgrade selection screen');
        this.gameUI.showUpgradeScreen((upgradeId: string) => {
            this.applyUpgrade(upgradeId);
        });
    }

    // Show multiple upgrade selections if delayed upgrades are pending
    private showUpgradeSelectionWithDelayed(): void {
        const upgradeCount = this.upgradeManager.initializeWaveUpgrades();
        console.log(
            `[UPGRADE] Showing upgrade selection screen (${upgradeCount} total upgrades available)`
        );

        this.showNextUpgradeSelection();
    }

    private showNextUpgradeSelection(): void {
        // Check if we still have upgrade selections to show
        if (this.upgradeManager.getRemainingUpgradeSelections() <= 0) {
            // No more upgrades to show, proceed to next wave
            this.startNextWave();
            return;
        }

        console.log(
            `[UPGRADE] Showing upgrade selection (${this.upgradeManager.getRemainingUpgradeSelections()} remaining)`
        );
        this.gameUI.showUpgradeScreen((upgradeId: string) => {
            this.applyUpgradeWithDelayed(upgradeId);
        });
    }

    private applyUpgradeWithDelayed(upgradeId: string): void {
        console.log(`[UPGRADE] Player selected upgrade: ${upgradeId}`);

        // Apply the upgrade normally
        this.applyUpgradeLogic(upgradeId);

        // Consume one upgrade selection (handles both normal and delayed)
        this.upgradeManager.consumeUpgradeSelection();

        // Show next upgrade selection or continue to next wave
        this.showNextUpgradeSelection();
    }

    private applyUpgrade(upgradeId: string): void {
        console.log(`[UPGRADE] Player selected upgrade: ${upgradeId}`);

        // Apply the upgrade logic
        this.applyUpgradeLogic(upgradeId);

        // Continue to next wave
        this.startNextWave();
    }

    private applyUpgradeLogic(upgradeId: string): void {
        // Handle instant upgrades
        if (this.upgradeManager.isInstantUpgrade(upgradeId)) {
            if (upgradeId === UPGRADE_CONFIG.INSTANT_HEAL) {
                // Instant heal: restore player to full health
                this.player.restoreFullHealth();
                console.log('[INSTANT_HEAL] Player health restored to maximum');
            } else if (upgradeId === UPGRADE_CONFIG.DELAYED_UPGRADE) {
                // Delayed upgrade: add bonus upgrade selections for next wave
                this.upgradeManager.addDelayedUpgrade();
                console.log(
                    '[DELAYED_UPGRADE] Delayed upgrade activated - next wave will have 3 upgrades'
                );
            }
            // Still need to apply to UpgradeManager to remove from pool
            this.upgradeManager.applyUpgrade(upgradeId);
        } else {
            // Apply permanent upgrade
            this.upgradeManager.applyUpgrade(upgradeId);

            // Update player stats based on new upgrades
            this.player.updateStatsFromUpgrades();

            // Setup auto-repair if that upgrade was selected
            this.player.setupAutoRepair();

            console.log(`[UPGRADE] Current upgrades: ${this.upgradeManager.getUpgradeStatus()}`);
        }
    }

    private cleanup(): void {
        // Clean up explosion manager
        if (this.explosionManager) {
            this.explosionManager.destroy();
        }

        // Clean up audio manager
        if (this.audioManager) {
            this.audioManager.destroy();
        }

        // Clean up enemy manager
        if (this.enemyManager) {
            this.enemyManager.destroy();
        }
    }
}
