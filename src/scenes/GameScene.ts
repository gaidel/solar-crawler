import { BULLET_CONFIG, GAME_CONFIG } from '../config/constants';
import { Player } from '../Player';
import { GameUI, GameState } from '../GameUI';
import { EnemyManager } from '../enemies/EnemyManager';
import { AudioManager } from '../AudioManager';

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private gameUI!: GameUI;
    private enemyManager!: EnemyManager;
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

        // Create UI system
        this.gameUI = new GameUI(this);
        this.gameUI.create();

        // Create enemy management system
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.create();

        // Set up collisions
        this.setupCollisions();
    }

    private setupCollisions(): void {
        // Bullet vs Asteroid collisions
        this.physics.add.collider(
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

        // Bullet vs Kamikaze collisions
        this.physics.add.collider(
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

        // Player vs Enemy collisions
        this.physics.add.collider(
            this.player.getSprite(),
            this.enemyManager.getAsteroidGroup(),
            this.gameOver,
            undefined,
            this
        );
        this.physics.add.collider(
            this.player.getSprite(),
            this.enemyManager.getKamikazeGroup(),
            this.gameOver,
            undefined,
            this
        );
    }

    update() {
        // Update UI (handles menu navigation in game over/victory states)
        this.gameUI.update();

        if (this.gameState !== GameState.PLAYING) {
            return; // Stop updating if game is not active
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

        // Clean up bullets
        this.cleanupBullets();
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
            }
        });
    }

    private handleEnemyHit(
        bullet: Phaser.Physics.Arcade.Sprite,
        enemy: Phaser.Physics.Arcade.Sprite
    ): void {
        // Deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);

        // Handle enemy hit and get score value
        const scoreValue = this.enemyManager.handleBulletCollision(enemy);
        this.score += scoreValue;
    }

    private gameOver(): void {
        this.gameState = GameState.GAME_OVER;
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
}
