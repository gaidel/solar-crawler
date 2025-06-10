import {
    PLAYER_CONFIG,
    ASTEROID_CONFIG,
    BULLET_CONFIG,
    GAME_CONFIG,
    UI_CONFIG,
    KAMIKAZE_CONFIG,
    SCORE_CONFIG,
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
    private kamikazes!: Phaser.Physics.Arcade.Group;
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
    private wKey!: Phaser.Input.Keyboard.Key;
    private sKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load assets
        this.load.image('player', 'assets/player.png');
        this.load.image('asteroid', 'assets/asteroid.png');
        this.load.image('kamikaze', 'assets/kamikaze.png');
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
        setupCircularCollision(this.player, 0.9); // Slightly smaller for forgiving gameplay

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

        // Create kamikazes group
        this.kamikazes = this.physics.add.group({
            defaultKey: 'kamikaze', // Use dedicated kamikaze sprite
            maxSize: KAMIKAZE_CONFIG.MAX_POOL_SIZE,
        });

        // Set up keyboard input
        this.cursors = this.input!.keyboard!.createCursorKeys()!;
        this.enterKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)!;
        
        // Add WASD keys as per PRD requirement
        const wKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W)!;
        const sKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S)!;
        
        // Store WASD keys for reference
        this.wKey = wKey;
        this.sKey = sKey;;

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
        this.physics.add.collider(
            this.bullets,
            this.kamikazes,
            (bullet, kamikaze) =>
                this.hitKamikaze(
                    bullet as Phaser.Physics.Arcade.Sprite,
                    kamikaze as Phaser.Physics.Arcade.Sprite
                ),
            undefined,
            this
        );
        this.physics.add.collider(this.player, this.asteroids, this.gameOver, undefined, this);
        this.physics.add.collider(this.player, this.kamikazes, this.gameOver, undefined, this);

        // Start spawning enemies
        this.time.addEvent({
            delay: ASTEROID_CONFIG.SPAWN_INTERVAL,
            callback: this.spawnAsteroid,
            callbackScope: this,
            loop: true,
        });

        this.time.addEvent({
            delay: KAMIKAZE_CONFIG.SPAWN_INTERVAL,
            callback: this.spawnKamikaze,
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

        // Handle player movement (both arrow keys and WASD)
        if (this.cursors.up?.isDown || this.wKey.isDown) {
            this.player.setVelocityY(-PLAYER_CONFIG.SPEED);
        } else if (this.cursors.down?.isDown || this.sKey.isDown) {
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

        // Clean up kamikazes (they can move in any direction now)
        this.kamikazes.getChildren().forEach((kamikaze) => {
            if (
                kamikaze instanceof Phaser.Physics.Arcade.Sprite &&
                kamikaze.active &&
                (kamikaze.x < -100 || kamikaze.x > GAME_CONFIG.WIDTH + 100 || 
                 kamikaze.y < -100 || kamikaze.y > GAME_CONFIG.HEIGHT + 100)
            ) {
                kamikaze.setActive(false);
                kamikaze.setVisible(false);
            }
        });

        // Update kamikaze homing behavior
        this.kamikazes.getChildren().forEach((kamikaze) => {
            if (kamikaze instanceof Phaser.Physics.Arcade.Sprite && kamikaze.active) {
                // Double check that this is actually a kamikaze (check texture key)
                if (kamikaze.texture.key === 'kamikaze') {
                    this.updateKamikazeHoming(kamikaze);
                }
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
            return; // Don't spawn asteroids if game is not active
        }

        const y = Phaser.Math.Between(ASTEROID_CONFIG.SPAWN_Y_MIN, ASTEROID_CONFIG.SPAWN_Y_MAX);
        const asteroid = this.asteroids.get(
            ASTEROID_CONFIG.SPAWN_X,
            y,
            'asteroid'
        ) as Phaser.Physics.Arcade.Sprite;

        if (asteroid) {
            asteroid.setActive(true);
            asteroid.setVisible(true);
            asteroid.setOrigin(0.5, 0.5);
            asteroid.setScale(ASTEROID_CONFIG.SCALE);
            asteroid.setVelocityX(ASTEROID_CONFIG.SPEED);

            // Set up collision using dynamic calculation
            setupCircularCollision(asteroid, 0.9); // Slightly smaller for forgiving gameplay
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
        asteroid.x = -200; // Move off-screen to left edge
        asteroid.setVelocityX(0); // Stop movement
        asteroid.setActive(false);
        asteroid.setVisible(false);

        // Re-enable physics body for future reuse
        if (asteroid.body) {
            asteroid.body.enable = true;
        }

        // Increase score for asteroid destruction
        this.score += SCORE_CONFIG.ASTEROID;
    }

    private hitKamikaze(
        bullet: Phaser.Physics.Arcade.Sprite,
        kamikaze: Phaser.Physics.Arcade.Sprite
    ) {
        // Deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);

        // Move kamikaze off-screen and deactivate it for reuse
        kamikaze.x = -200; // Move off-screen to left edge
        kamikaze.setVelocityX(0); // Stop X movement
        kamikaze.setVelocityY(0); // Stop Y movement too
        kamikaze.setActive(false);
        kamikaze.setVisible(false);

        // Re-enable physics body for future reuse
        if (kamikaze.body) {
            kamikaze.body.enable = true;
        }

        // Increase score for kamikaze destruction (higher value for harder enemy)
        this.score += SCORE_CONFIG.KAMIKAZE;
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
        this.player.setTint(0x44ff44); // Green tint for victory
        this.showVictoryScreen();
    }

    private fireBullet() {
        const bullet = this.bullets.get(
            this.player.x + BULLET_CONFIG.OFFSET_X,
            this.player.y,
            'bullet'
        );
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setScale(BULLET_CONFIG.SCALE);
            bullet.setVelocityX(BULLET_CONFIG.SPEED);
            bullet.setVelocityY(0); // Explicitly set Y velocity to 0 for straight movement
            bullet.clearTint(); // Make sure bullet has no tint
        }
    }

    private updateKamikazeHoming(kamikaze: Phaser.Physics.Arcade.Sprite) {
        // Calculate direction vector to player
        const deltaX = this.player.x - kamikaze.x;
        const deltaY = this.player.y - kamikaze.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Only home if player is reasonably far
        if (distance > 10) {
            // Normalize the direction vector and apply speed
            const normalizedX = deltaX / distance;
            const normalizedY = deltaY / distance;
            
            // Use absolute value of HOMING_SPEED as the total speed
            const speed = Math.abs(KAMIKAZE_CONFIG.HOMING_SPEED);
            kamikaze.setVelocityX(normalizedX * speed);
            kamikaze.setVelocityY(normalizedY * speed);
        } else {
            // Stop moving when very close to player
            kamikaze.setVelocityX(0);
            kamikaze.setVelocityY(0);
        }
    }

    private spawnKamikaze() {
        if (this.gameState !== GameState.PLAYING) {
            return; // Don't spawn kamikazes if game is not active
        }

        const y = Phaser.Math.Between(KAMIKAZE_CONFIG.SPAWN_Y_MIN, KAMIKAZE_CONFIG.SPAWN_Y_MAX);
        const kamikaze = this.kamikazes.get(KAMIKAZE_CONFIG.SPAWN_X, y, 'kamikaze') as Phaser.Physics.Arcade.Sprite;
        
        if (kamikaze) {
            kamikaze.setActive(true);
            kamikaze.setVisible(true);
            kamikaze.setOrigin(0.5, 0.5);
            kamikaze.setScale(KAMIKAZE_CONFIG.SCALE);
            kamikaze.setFlipX(true); // Flip horizontally so the front (right side) points toward player
            kamikaze.setVelocityX(0); // Start without movement, homing system will handle it
            kamikaze.setVelocityY(0); // Start without movement
            
            // Clear tint to show original sprite colors
            kamikaze.clearTint();
            
            // Set up collision using dynamic calculation
            setupCircularCollision(kamikaze, 0.9);
        }
    }
}
