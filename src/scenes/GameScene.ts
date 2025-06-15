import { BULLET_CONFIG, GAME_CONFIG, DAMAGE_CONFIG } from '../config/constants';
import { Player } from '../Player';
import { GameUI, GameState } from '../GameUI';
import { EnemyManager } from '../enemies/EnemyManager';
import { AudioManager } from '../AudioManager';
import { ExplosionManager } from '../ExplosionManager';

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private gameUI!: GameUI;
    private enemyManager!: EnemyManager;
    private explosionManager!: ExplosionManager;
    private bullets!: Phaser.Physics.Arcade.Group;
    private audioManager!: AudioManager;

    // Game state
    private gameState: GameState = GameState.PLAYING;
    private startTime: number = 0;
    private score: number = 0;
    private currentWave: number = 1;
    private waveStartTime: number = 0;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load scene-specific assets
        this.load.image('background', 'assets/background.png');

        // Load assets for game entities
        Player.preload(this);
        EnemyManager.preload(this);
        ExplosionManager.preload(this);

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

        // Add background
        const bg = this.add.tileSprite(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            'background'
        )!;
        bg.setScrollFactor(0);

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

        // Create UI system
        this.gameUI = new GameUI(this);
        this.gameUI.create();
        this.gameUI.setAudioManager(this.audioManager);

        // Create enemy management system
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.setAudioManager(this.audioManager);
        this.enemyManager.setCurrentWave(this.currentWave);
        this.enemyManager.create();

        // Create explosion manager
        this.explosionManager = new ExplosionManager(this);
        this.explosionManager.create();

        // Connect explosion manager to enemy manager
        this.enemyManager.setExplosionManager(this.explosionManager);

        // Set up collisions
        this.setupCollisions();

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

        // Check for victory condition (wave completion)
        const waveElapsedTime = this.time.now - this.waveStartTime;
        if (waveElapsedTime >= GAME_CONFIG.WAVE_DURATION) {
            this.completeWave();
            return;
        }

        // Update background
        const bg = this.children.list[0] as Phaser.GameObjects.TileSprite;
        bg.tilePositionX += GAME_CONFIG.BACKGROUND_SCROLL_SPEED;

        // Get input from UI and update player
        const playerInput = this.gameUI.getPlayerInput();
        this.player.update(this.time.now, playerInput);

        // Update enemy manager with player position
        this.enemyManager.update(this.player.getX(), this.player.getY());

        // Update HUD with wave information
        const waveTimeLeft = Math.max(0, GAME_CONFIG.WAVE_DURATION - waveElapsedTime);
        this.gameUI.updateHUD(this.score, waveTimeLeft, this.currentWave, GAME_CONFIG.TOTAL_WAVES);

        // Update player HP display
        this.gameUI.updatePlayerHP(this.player.getCurrentHP(), this.player.getMaxHP());

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

    private handleEnemyHit(
        bullet: Phaser.Physics.Arcade.Sprite,
        enemy: Phaser.Physics.Arcade.Sprite
    ): void {
        // Check if bullet is already processed (prevent multiple hits)
        if (!bullet.active) {
            return;
        }

        // Properly deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);

        // Disable physics body to prevent further collisions
        if (bullet.body) {
            bullet.body.enable = false;
        }

        // Handle enemy hit and get score value
        const scoreValue = this.enemyManager.handleBulletCollision(enemy);
        this.score += scoreValue;
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

        // Destroy the enemy
        enemySprite.setActive(false);
        enemySprite.setVisible(false);

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

        // Destroy the enemy
        enemySprite.setActive(false);
        enemySprite.setVisible(false);

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

        // Destroy the enemy
        enemySprite.setActive(false);
        enemySprite.setVisible(false);

        // Create explosion at enemy position - size based on leaper type
        if (this.explosionManager) {
            // All leaper types are the same size, so use large explosion
            this.explosionManager.explodeLarge(enemySprite.x, enemySprite.y);
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

        // Destroy the enemy
        enemySprite.setActive(false);
        enemySprite.setVisible(false);

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

        // Show wave completion message
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

        // Update enemy manager with new wave number
        this.enemyManager.setCurrentWave(this.currentWave);

        // Resume physics
        this.physics.resume();

        // Restart enemy spawning (recreate timers based on new wave)
        this.enemyManager.restartSpawning();
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

        // Return to main menu
        this.scene.switch('MainMenuScene');
    }

    private pauseGame(): void {
        this.gameState = GameState.PAUSED;

        // Pause physics
        this.physics.pause();

        // Pause enemy spawning
        this.enemyManager.pauseSpawning();

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

        // Resume enemy spawning
        this.enemyManager.resumeSpawning();

        // Clear any UI overlays
        this.gameUI.clearScreens();
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
