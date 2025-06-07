import {
    PLAYER_CONFIG,
    ASTEROID_CONFIG,
    BULLET_CONFIG,
    GAME_CONFIG,
    UI_CONFIG,
} from '../config/constants';
import { setupCircularCollision } from '../utils/CollisionHelpers';

enum GameState {
    PLAYING,
    GAME_OVER,
    VICTORY,
}

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private asteroids!: Phaser.Physics.Arcade.Group;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private lastFired = 0;
    private bullets!: Phaser.Physics.Arcade.Group;

    // Game state and UI
    private gameState: GameState = GameState.PLAYING;
    private startTime: number = 0;
    private uiOverlay!: Phaser.GameObjects.Container;
    private scoreText!: Phaser.GameObjects.Text;
    private score: number = 0;
    private enterKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load assets
        this.load.image('player', 'assets/player.png');
        this.load.image('asteroid', 'assets/asteroid.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('background', 'assets/background.png');
    }

    create() {
        // Initialize game state
        this.gameState = GameState.PLAYING;
        this.startTime = this.time.now;
        this.score = 0;

        // Add background
        const bg = this.add.tileSprite(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            'background'
        )!;
        bg.setScrollFactor(0);

        // Create player
        this.player = this.physics.add.sprite(
            PLAYER_CONFIG.START_X,
            PLAYER_CONFIG.START_Y,
            'player'
        )!;
        this.player.setCollideWorldBounds(true);
        this.player.setScale(PLAYER_CONFIG.SCALE);
        this.player.setOrigin(0.5, 0.5);

        // Set up player collision using dynamic calculation
        setupCircularCollision(this.player, 0.9); // Чуть меньше для более щадящего геймплея

        // Create bullets group
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: BULLET_CONFIG.MAX_POOL_SIZE,
            runChildUpdate: true,
        });

        // Create asteroids group
        this.asteroids = this.physics.add.group({
            defaultKey: 'asteroid',
            maxSize: ASTEROID_CONFIG.MAX_POOL_SIZE,
        });

        // Set up keyboard input
        this.cursors = this.input!.keyboard!.createCursorKeys()!;
        this.enterKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)!;

        // Set up collisions
        this.physics.add.collider(
            this.bullets,
            this.asteroids,
            (bullet, asteroid) =>
                this.hitAsteroid(
                    bullet as Phaser.Physics.Arcade.Sprite,
                    asteroid as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );
        this.physics.add.collider(this.player, this.asteroids, this.gameOver, undefined, this);

        // Start spawning asteroids
        this.time.addEvent({
            delay: ASTEROID_CONFIG.SPAWN_INTERVAL,
            callback: this.spawnAsteroid,
            callbackScope: this,
            loop: true,
        });

        // Create UI
        this.createUI();
    }

    update() {
        // Check for restart input in game over/victory states
        if (
            (this.gameState === GameState.GAME_OVER || this.gameState === GameState.VICTORY) &&
            Phaser.Input.Keyboard.JustDown(this.enterKey)
        ) {
            this.restart();
            return;
        }

        if (this.gameState !== GameState.PLAYING) {
            return; // Останавливаем обновление если игра не активна
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

        // Handle player movement
        if (this.cursors.up?.isDown) {
            this.player.setVelocityY(-PLAYER_CONFIG.SPEED);
        } else if (this.cursors.down?.isDown) {
            this.player.setVelocityY(PLAYER_CONFIG.SPEED);
        } else {
            this.player.setVelocityY(0);
        }

        // Auto-fire bullets
        if (this.time.now > this.lastFired) {
            this.fireBullet();
            this.lastFired = this.time.now + PLAYER_CONFIG.FIRE_RATE;
        }

        // Update score display
        const timeLeft = Math.max(0, GAME_CONFIG.WIN_TIME - elapsedTime);
        this.scoreText.setText(`Score: ${this.score}  Time: ${Math.ceil(timeLeft / 1000)}s`);

        // Clean up bullets
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

        // Clean up asteroids
        this.asteroids.getChildren().forEach((asteroid) => {
            if (
                asteroid instanceof Phaser.Physics.Arcade.Sprite &&
                asteroid.active &&
                asteroid.x < -100
            ) {
                asteroid.setActive(false);
                asteroid.setVisible(false);
            }
        });
    }

    private createUI() {
        // Score text
        this.scoreText = this.add.text(20, 20, 'Score: 0  Time: 60s', {
            fontSize: UI_CONFIG.FONT_SIZE_SMALL,
            color: '#ffffff',
        });
        this.scoreText.setScrollFactor(0);
    }

    private showGameOverScreen() {
        // Create overlay
        this.uiOverlay = this.add.container(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2);

        // Semi-transparent background
        const overlay = this.add.rectangle(
            0,
            0,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            0x000000,
            UI_CONFIG.OVERLAY_ALPHA
        );
        this.uiOverlay.add(overlay);

        // Game Over text
        const gameOverText = this.add
            .text(0, -100, 'GAME OVER', {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#ff4444',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(gameOverText);

        // Final score
        const finalScoreText = this.add
            .text(0, -40, `Final Score: ${this.score}`, {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(finalScoreText);

        // Restart button
        const restartButton = this.add
            .text(0, 40, 'RESTART', {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#44ff44',
                align: 'center',
            })
            .setOrigin(0.5);

        restartButton.setInteractive({ useHandCursor: true });
        restartButton.on('pointerdown', () => this.restart());
        restartButton.on('pointerover', () => restartButton.setStyle({ color: '#88ff88' }));
        restartButton.on('pointerout', () => restartButton.setStyle({ color: '#44ff44' }));

        this.uiOverlay.add(restartButton);

        // Enter key hint
        const enterHint = this.add
            .text(0, 80, 'Press ENTER to restart', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(enterHint);

        this.uiOverlay.setScrollFactor(0);
    }

    private showVictoryScreen() {
        // Create overlay
        this.uiOverlay = this.add.container(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2);

        // Semi-transparent background
        const overlay = this.add.rectangle(
            0,
            0,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            0x000000,
            UI_CONFIG.OVERLAY_ALPHA
        );
        this.uiOverlay.add(overlay);

        // Victory text
        const victoryText = this.add
            .text(0, -100, 'VICTORY!', {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#44ff44',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(victoryText);

        // Congratulations text
        const congratsText = this.add
            .text(0, -40, 'You survived the solar crawler!', {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(congratsText);

        // Final score
        const finalScoreText = this.add
            .text(0, 0, `Final Score: ${this.score}`, {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(finalScoreText);

        // Play again button
        const playAgainButton = this.add
            .text(0, 60, 'PLAY AGAIN', {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#44ff44',
                align: 'center',
            })
            .setOrigin(0.5);

        playAgainButton.setInteractive({ useHandCursor: true });
        playAgainButton.on('pointerdown', () => this.restart());
        playAgainButton.on('pointerover', () => playAgainButton.setStyle({ color: '#88ff88' }));
        playAgainButton.on('pointerout', () => playAgainButton.setStyle({ color: '#44ff44' }));

        this.uiOverlay.add(playAgainButton);

        // Enter key hint
        const enterHint = this.add
            .text(0, 100, 'Press ENTER to play again', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(enterHint);

        this.uiOverlay.setScrollFactor(0);
    }

    private restart() {
        // Clean up UI
        if (this.uiOverlay) {
            this.uiOverlay.destroy();
        }

        // Restart the scene
        this.scene.restart();
    }

    private spawnAsteroid() {
        if (this.gameState !== GameState.PLAYING) {
            return; // Не спавним астероиды если игра не активна
        }

        const y = Phaser.Math.Between(ASTEROID_CONFIG.SPAWN_Y_MIN, ASTEROID_CONFIG.SPAWN_Y_MAX);
        const asteroid = this.asteroids.get(
            ASTEROID_CONFIG.SPAWN_X,
            y,
            'asteroid'
        ) as Phaser.Physics.Arcade.Sprite;

        if (asteroid) {
            console.log('Spawning asteroid at:', ASTEROID_CONFIG.SPAWN_X, y);
            asteroid.setActive(true);
            asteroid.setVisible(true);
            asteroid.setOrigin(0.5, 0.5);
            asteroid.setScale(ASTEROID_CONFIG.SCALE);
            asteroid.setVelocityX(ASTEROID_CONFIG.SPEED);

            // Set up collision using dynamic calculation
            setupCircularCollision(asteroid, 0.9); // Чуть меньше для более щадящего геймплея

            console.log('Asteroid size:', asteroid.displayWidth, 'x', asteroid.displayHeight);
        }
    }

    private hitAsteroid(
        bullet: Phaser.Physics.Arcade.Sprite,
        asteroid: Phaser.Physics.Arcade.Sprite
    ) {
        // Deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);

        // Move asteroid off-screen and deactivate it for reuse
        asteroid.x = -200; // Перемещаем за левый край экрана
        asteroid.setVelocityX(0); // Останавливаем движение
        asteroid.setActive(false);
        asteroid.setVisible(false);

        // Re-enable physics body for future reuse
        if (asteroid.body) {
            asteroid.body.enable = true;
        }

        // Increase score
        this.score += 10;

        console.log('Asteroid destroyed, moved off-screen for reuse');
    }

    private gameOver() {
        this.gameState = GameState.GAME_OVER;
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.showGameOverScreen();
    }

    private victory() {
        this.gameState = GameState.VICTORY;
        this.physics.pause();
        this.player.setTint(0x44ff44); // Зеленый цвет для победы
        this.showVictoryScreen();
    }

    private fireBullet() {
        const bullet = this.bullets.get(
            this.player.x + BULLET_CONFIG.OFFSET_X,
            this.player.y,
            'bullet'
        );
        if (bullet) {
            console.log(
                'Creating bullet at:',
                this.player.x + BULLET_CONFIG.OFFSET_X,
                this.player.y
            );
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setScale(BULLET_CONFIG.SCALE);
            bullet.setVelocityX(BULLET_CONFIG.SPEED);
            console.log('Bullet created, active:', bullet.active, 'visible:', bullet.visible);
        } else {
            console.log('Failed to create bullet - no available bullets in pool');
        }
    }
}
