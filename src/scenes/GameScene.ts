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
            (player, enemy) => this.handlePlayerEnemyCollision(player as Phaser.Physics.Arcade.Sprite, enemy as Phaser.Physics.Arcade.Sprite, DAMAGE_CONFIG.ASTEROID_COLLISION),
            undefined,
            this
        );
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyManager.getKamikazeGroup(),
            (player, enemy) => this.handlePlayerEnemyCollision(player as Phaser.Physics.Arcade.Sprite, enemy as Phaser.Physics.Arcade.Sprite, DAMAGE_CONFIG.KAMIKAZE_COLLISION),
            undefined,
            this
        );
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyManager.getGunnerGroup(),
            (player, enemy) => this.handlePlayerEnemyCollision(player as Phaser.Physics.Arcade.Sprite, enemy as Phaser.Physics.Arcade.Sprite, DAMAGE_CONFIG.GUNNER_COLLISION),
            undefined,
            this
        );
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyManager.getLeaperGroup(),
            (player, enemy) => this.handlePlayerEnemyCollision(player as Phaser.Physics.Arcade.Sprite, enemy as Phaser.Physics.Arcade.Sprite, DAMAGE_CONFIG.LEAPER_COLLISION),
            undefined,
            this
        );

        // Player vs Enemy bullets
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyManager.getEnemyBullets(),
            (player, bullet) => this.handlePlayerBulletCollision(player as Phaser.Physics.Arcade.Sprite, bullet as Phaser.Physics.Arcade.Sprite),
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

        // Check for victory condition
        const elapsedTime = this.time.now - this.startTime;
        if (elapsedTime >= GAME_CONFIG.WIN_TIME) {
            this.victory();
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

        // Update HUD
        const timeLeft = Math.max(0, GAME_CONFIG.WIN_TIME - elapsedTime);
        this.gameUI.updateHUD(this.score, timeLeft);
        
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

    private gameOver(): void {
        this.gameState = GameState.GAME_OVER;

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

    private victory(): void {
        this.gameState = GameState.VICTORY;
        this.gameUI.victory(
            this.score,
            (color: number) => this.player.setTint(color),
            () => this.physics.pause(),
            () => this.enemyManager.stopSpawning(),
            () => this.restart(),
            () => this.returnToMenu()
        );
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
