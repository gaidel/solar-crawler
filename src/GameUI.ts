import { GAME_CONFIG, UI_CONFIG } from './config/constants';

export enum GameState {
    PLAYING,
    GAME_OVER,
    VICTORY,
}

export interface PlayerInput {
    moveUp: boolean;
    moveDown: boolean;
}

export class GameUI {
    private scene: Phaser.Scene;
    private uiOverlay?: Phaser.GameObjects.Container;
    private scoreText!: Phaser.GameObjects.Text;

    // Input keys
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wKey!: Phaser.Input.Keyboard.Key;
    private sKey!: Phaser.Input.Keyboard.Key;
    private enterKey!: Phaser.Input.Keyboard.Key;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    create(): void {
        // Set up all keyboard input
        this.setupInput();

        // Create HUD elements
        this.createHUD();
    }

    private setupInput(): void {
        // Set up keyboard input
        this.cursors = this.scene.input!.keyboard!.createCursorKeys()!;

        // Add WASD keys as per PRD requirement
        this.wKey = this.scene.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W)!;
        this.sKey = this.scene.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S)!;

        // Add Enter key for UI interactions
        this.enterKey = this.scene.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)!;
    }

    private createHUD(): void {
        // Score and timer display
        this.scoreText = this.scene.add.text(20, 20, 'Score: 0  Time: 60s', {
            fontSize: UI_CONFIG.FONT_SIZE_SMALL,
            color: '#ffffff',
        });
        this.scoreText.setScrollFactor(0);
    }

    // Input handling methods
    getPlayerInput(): PlayerInput {
        return {
            moveUp: this.cursors.up?.isDown || this.wKey.isDown,
            moveDown: this.cursors.down?.isDown || this.sKey.isDown,
        };
    }

    isEnterPressed(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.enterKey);
    }

    // HUD update methods
    updateHUD(score: number, timeLeft: number): void {
        this.scoreText.setText(`Score: ${score}  Time: ${Math.ceil(timeLeft / 1000)}s`);
    }

    // Screen management methods
    showGameOverScreen(score: number, onRestart: () => void): void {
        this.clearScreens();

        // Create overlay
        this.uiOverlay = this.scene.add.container(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2);

        // Semi-transparent background
        const overlay = this.scene.add.rectangle(
            0,
            0,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            0x000000,
            UI_CONFIG.OVERLAY_ALPHA
        );
        this.uiOverlay.add(overlay);

        // Game Over text
        const gameOverText = this.scene.add
            .text(0, -100, 'GAME OVER', {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#ff4444',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(gameOverText);

        // Final score
        const finalScoreText = this.scene.add
            .text(0, -40, `Final Score: ${score}`, {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(finalScoreText);

        // Restart button
        const restartButton = this.scene.add
            .text(0, 40, 'RESTART', {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#44ff44',
                align: 'center',
            })
            .setOrigin(0.5);

        restartButton.setInteractive({ useHandCursor: true });
        restartButton.on('pointerdown', onRestart);
        restartButton.on('pointerover', () => restartButton.setStyle({ color: '#88ff88' }));
        restartButton.on('pointerout', () => restartButton.setStyle({ color: '#44ff44' }));

        this.uiOverlay.add(restartButton);

        // Enter key hint
        const enterHint = this.scene.add
            .text(0, 80, 'Press ENTER to restart', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(enterHint);

        this.uiOverlay.setScrollFactor(0);
    }

    showVictoryScreen(score: number, onRestart: () => void): void {
        this.clearScreens();

        // Create overlay
        this.uiOverlay = this.scene.add.container(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2);

        // Semi-transparent background
        const overlay = this.scene.add.rectangle(
            0,
            0,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            0x000000,
            UI_CONFIG.OVERLAY_ALPHA
        );
        this.uiOverlay.add(overlay);

        // Victory text
        const victoryText = this.scene.add
            .text(0, -100, 'VICTORY!', {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#44ff44',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(victoryText);

        // Congratulations text
        const congratsText = this.scene.add
            .text(0, -40, 'You survived the solar crawler!', {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(congratsText);

        // Final score
        const finalScoreText = this.scene.add
            .text(0, 0, `Final Score: ${score}`, {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(finalScoreText);

        // Play again button
        const playAgainButton = this.scene.add
            .text(0, 60, 'PLAY AGAIN', {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#44ff44',
                align: 'center',
            })
            .setOrigin(0.5);

        playAgainButton.setInteractive({ useHandCursor: true });
        playAgainButton.on('pointerdown', onRestart);
        playAgainButton.on('pointerover', () => playAgainButton.setStyle({ color: '#88ff88' }));
        playAgainButton.on('pointerout', () => playAgainButton.setStyle({ color: '#44ff44' }));

        this.uiOverlay.add(playAgainButton);

        // Enter key hint
        const enterHint = this.scene.add
            .text(0, 100, 'Press ENTER to play again', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(enterHint);

        this.uiOverlay.setScrollFactor(0);
    }

    clearScreens(): void {
        if (this.uiOverlay) {
            this.uiOverlay.destroy();
            this.uiOverlay = undefined;
        }
    }

    // Game state management methods
    gameOver(
        score: number,
        onPlayerTint: (color: number) => void,
        onPhysicsPause: () => void,
        onStopSpawning: () => void,
        onRestart: () => void
    ): void {
        // Handle game state changes
        onPhysicsPause();
        onPlayerTint(0xff0000); // Red tint for game over
        onStopSpawning();

        // Show game over screen
        this.showGameOverScreen(score, onRestart);
    }

    victory(
        score: number,
        onPlayerTint: (color: number) => void,
        onPhysicsPause: () => void,
        onStopSpawning: () => void,
        onRestart: () => void
    ): void {
        // Handle game state changes
        onPhysicsPause();
        onPlayerTint(0x44ff44); // Green tint for victory
        onStopSpawning();

        // Show victory screen
        this.showVictoryScreen(score, onRestart);
    }

    destroy(): void {
        this.clearScreens();
        if (this.scoreText) {
            this.scoreText.destroy();
        }
    }
}
