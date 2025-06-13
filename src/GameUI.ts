import { GAME_CONFIG, UI_CONFIG } from './config/constants';

export enum GameState {
    PLAYING,
    PAUSED,
    GAME_OVER,
    VICTORY,
}

export interface PlayerInput {
    moveUp: boolean;
    moveDown: boolean;
    action: boolean;
}

export class GameUI {
    private scene: Phaser.Scene;
    private uiOverlay?: Phaser.GameObjects.Container;
    private scoreText!: Phaser.GameObjects.Text;

    // Menu navigation
    private menuItems: Phaser.GameObjects.Text[] = [];
    private selectedIndex: number = 0;
    private menuCallbacks: (() => void)[] = [];
    
    // Pause system
    private pauseCallbacks: {
        onResume?: () => void;
        onReturnToMenu?: () => void;
    } = {};
    private showingConfirmation = false;

    // Input keys
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wKey!: Phaser.Input.Keyboard.Key;
    private sKey!: Phaser.Input.Keyboard.Key;
    private enterKey!: Phaser.Input.Keyboard.Key;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private escKey!: Phaser.Input.Keyboard.Key;

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

        // Add action keys for UI interactions
        this.enterKey = this.scene.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)!;
        this.spaceKey = this.scene.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)!;

        // Add ESC key for menu navigation
        this.escKey = this.scene.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)!;
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
            action: this.enterKey.isDown || this.spaceKey.isDown,
        };
    }

    isEnterPressed(): boolean {
        return (
            Phaser.Input.Keyboard.JustDown(this.enterKey) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey)
        );
    }

    // HUD update methods
    updateHUD(score: number, timeLeft: number): void {
        this.scoreText.setText(`Score: ${score}  Time: ${Math.ceil(timeLeft / 1000)}s`);
    }

    // Update method for menu navigation (called from GameScene)
    update(): void {
        if (this.menuItems.length > 0) {
            this.handleMenuNavigation();
        }
    }

    // Screen management methods
    showGameOverScreen(score: number, onRestart: () => void, onReturnToMenu: () => void): void {
        this.clearScreens();

        // Reset menu state
        this.menuItems = [];
        this.menuCallbacks = [onRestart, onReturnToMenu];
        this.selectedIndex = 0; // Default to RESTART

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
            .text(0, -120, 'GAME OVER', {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#ff4444',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(gameOverText);

        // Final score
        const finalScoreText = this.scene.add
            .text(0, -60, `Final Score: ${score}`, {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(finalScoreText);

        // Create menu items
        const menuOptions = [
            { text: 'RESTART', y: 0 },
            { text: 'RETURN TO MENU', y: 50 },
        ];

        menuOptions.forEach((option, index) => {
            const menuItem = this.scene.add
                .text(0, option.y, option.text, {
                    fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                    color: '#ffffff',
                    align: 'center',
                })
                .setOrigin(0.5);

            // Mouse interactions
            menuItem.setInteractive({ useHandCursor: true });
            menuItem.on('pointerover', () => {
                this.selectedIndex = index;
                this.updateMenuSelection();
            });
            menuItem.on('pointerdown', () => {
                this.menuCallbacks[index]();
            });

            this.menuItems.push(menuItem);
            this.uiOverlay!.add(menuItem);
        });

        // Control hints
        const controlHint = this.scene.add
            .text(0, 100, 'W/S to navigate | ENTER to select | ESC for menu', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(controlHint);

        this.uiOverlay.setScrollFactor(0);

        // Initial selection
        this.updateMenuSelection();
    }

    showVictoryScreen(score: number, onRestart: () => void, onReturnToMenu: () => void): void {
        this.clearScreens();

        // Reset menu state
        this.menuItems = [];
        this.menuCallbacks = [onRestart, onReturnToMenu];
        this.selectedIndex = 0; // Default to PLAY AGAIN

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
            .text(0, -120, 'VICTORY!', {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#44ff44',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(victoryText);

        // Congratulations text
        const congratsText = this.scene.add
            .text(0, -60, 'You survived the solar crawler!', {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(congratsText);

        // Final score
        const finalScoreText = this.scene.add
            .text(0, -20, `Final Score: ${score}`, {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(finalScoreText);

        // Create menu items
        const menuOptions = [
            { text: 'PLAY AGAIN', y: 30 },
            { text: 'RETURN TO MENU', y: 80 },
        ];

        menuOptions.forEach((option, index) => {
            const menuItem = this.scene.add
                .text(0, option.y, option.text, {
                    fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                    color: '#ffffff',
                    align: 'center',
                })
                .setOrigin(0.5);

            // Mouse interactions
            menuItem.setInteractive({ useHandCursor: true });
            menuItem.on('pointerover', () => {
                this.selectedIndex = index;
                this.updateMenuSelection();
            });
            menuItem.on('pointerdown', () => {
                this.menuCallbacks[index]();
            });

            this.menuItems.push(menuItem);
            this.uiOverlay!.add(menuItem);
        });

        // Control hints
        const controlHint = this.scene.add
            .text(0, 120, 'W/S to navigate | ENTER to select | ESC for menu', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(controlHint);

        this.uiOverlay.setScrollFactor(0);

        // Initial selection
        this.updateMenuSelection();
    }

    showPauseMenu(onResume: () => void, onReturnToMenu: () => void): void {
        this.clearScreens();
        this.showingConfirmation = false;

        // Store callbacks
        this.pauseCallbacks.onResume = onResume;
        this.pauseCallbacks.onReturnToMenu = onReturnToMenu;

        // Reset menu state
        this.menuItems = [];
        this.menuCallbacks = [onResume, () => this.showExitConfirmation()];
        this.selectedIndex = 0; // Default to RESUME

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

        // Pause text
        const pauseText = this.scene.add
            .text(0, -120, 'GAME PAUSED', {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#ffff44',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(pauseText);

        // Create menu items
        const menuOptions = [
            { text: 'RESUME GAME', y: -20 },
            { text: 'RETURN TO MENU', y: 30 },
        ];

        menuOptions.forEach((option, index) => {
            const menuItem = this.scene.add
                .text(0, option.y, option.text, {
                    fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                    color: '#ffffff',
                    align: 'center',
                })
                .setOrigin(0.5);

            // Mouse interactions
            menuItem.setInteractive({ useHandCursor: true });
            menuItem.on('pointerover', () => {
                this.selectedIndex = index;
                this.updateMenuSelection();
            });
            menuItem.on('pointerdown', () => {
                this.menuCallbacks[index]();
            });

            this.menuItems.push(menuItem);
            this.uiOverlay!.add(menuItem);
        });

        // Control hints
        const controlHint = this.scene.add
            .text(0, 80, 'W/S to navigate | ENTER to select', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(controlHint);

        this.uiOverlay.setScrollFactor(0);

        // Initial selection
        this.updateMenuSelection();
    }

    private showExitConfirmation(): void {
        this.clearScreens();
        this.showingConfirmation = true;

        // Reset menu state
        this.menuItems = [];
        this.menuCallbacks = [
            () => this.showPauseMenu(this.pauseCallbacks.onResume!, this.pauseCallbacks.onReturnToMenu!),
            this.pauseCallbacks.onReturnToMenu!
        ];
        this.selectedIndex = 0; // Default to NO

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

        // Confirmation text
        const confirmText = this.scene.add
            .text(0, -80, 'EXIT TO MAIN MENU?', {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#ff8844',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(confirmText);

        const warningText = this.scene.add
            .text(0, -30, 'Your progress will be lost!', {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ff4444',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(warningText);

        // Create menu items
        const menuOptions = [
            { text: 'NO, CONTINUE PLAYING', y: 20 },
            { text: 'YES, EXIT TO MENU', y: 70 },
        ];

        menuOptions.forEach((option, index) => {
            const menuItem = this.scene.add
                .text(0, option.y, option.text, {
                    fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                    color: '#ffffff',
                    align: 'center',
                })
                .setOrigin(0.5);

            // Mouse interactions
            menuItem.setInteractive({ useHandCursor: true });
            menuItem.on('pointerover', () => {
                this.selectedIndex = index;
                this.updateMenuSelection();
            });
            menuItem.on('pointerdown', () => {
                this.menuCallbacks[index]();
            });

            this.menuItems.push(menuItem);
            this.uiOverlay!.add(menuItem);
        });

        // Control hints
        const controlHint = this.scene.add
            .text(0, 120, 'W/S to navigate | ENTER to select | ESC to cancel', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(controlHint);

        this.uiOverlay.setScrollFactor(0);

        // Initial selection
        this.updateMenuSelection();
    }

    clearScreens(): void {
        if (this.uiOverlay) {
            this.uiOverlay.destroy();
            this.uiOverlay = undefined;
        }
        // Clear menu state
        this.menuItems = [];
        this.menuCallbacks = [];
        this.selectedIndex = 0;
        this.showingConfirmation = false;
    }

    // ESC key handling
    isEscPressed(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.escKey);
    }

    isPausePressed(): boolean {
        return (
            Phaser.Input.Keyboard.JustDown(this.enterKey) ||
            Phaser.Input.Keyboard.JustDown(this.escKey)
        );
    }

    // Menu navigation methods
    private updateMenuSelection(): void {
        this.menuItems.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.setColor('#00ff00');
                item.setScale(1.1);
            } else {
                item.setColor('#ffffff');
                item.setScale(1.0);
            }
        });
    }

    private handleMenuNavigation(): void {
        // Handle menu navigation input
        if (
            Phaser.Input.Keyboard.JustDown(this.cursors.up!) ||
            Phaser.Input.Keyboard.JustDown(this.wKey)
        ) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.updateMenuSelection();
        }

        if (
            Phaser.Input.Keyboard.JustDown(this.cursors.down!) ||
            Phaser.Input.Keyboard.JustDown(this.sKey)
        ) {
            this.selectedIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
            this.updateMenuSelection();
        }

        // Handle menu selection
        if (this.isEnterPressed()) {
            if (this.selectedIndex >= 0 && this.selectedIndex < this.menuCallbacks.length) {
                this.menuCallbacks[this.selectedIndex]();
            }
        }

        // Handle ESC key differently based on context
        if (this.isEscPressed() && this.menuCallbacks.length > 1) {
            if (this.showingConfirmation) {
                // In confirmation dialog, ESC means "NO, cancel the exit"
                this.menuCallbacks[0](); // First option is always "NO, CONTINUE PLAYING"
            } else {
                // In other menus, ESC means "go to menu" (second option)
                this.menuCallbacks[1](); // Return to menu is always second option
            }
        }
    }

    // Game state management methods
    gameOver(
        score: number,
        onPlayerTint: (color: number) => void,
        onPhysicsPause: () => void,
        onStopSpawning: () => void,
        onRestart: () => void,
        onReturnToMenu: () => void
    ): void {
        // Handle game state changes
        onPhysicsPause();
        onPlayerTint(0xff0000); // Red tint for game over
        onStopSpawning();

        // Show game over screen
        this.showGameOverScreen(score, onRestart, onReturnToMenu);
    }

    victory(
        score: number,
        onPlayerTint: (color: number) => void,
        onPhysicsPause: () => void,
        onStopSpawning: () => void,
        onRestart: () => void,
        onReturnToMenu: () => void
    ): void {
        // Handle game state changes
        onPhysicsPause();
        onPlayerTint(0x44ff44); // Green tint for victory
        onStopSpawning();

        // Show victory screen
        this.showVictoryScreen(score, onRestart, onReturnToMenu);
    }

    destroy(): void {
        this.clearScreens();
        if (this.scoreText) {
            this.scoreText.destroy();
        }
    }
}
