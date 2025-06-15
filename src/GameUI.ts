import { GAME_CONFIG, UI_CONFIG } from './config/constants';
import { AudioManager } from './AudioManager';

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

    // Settings system
    private showingSettings = false;
    private settingsCallback?: () => void;
    private audioManager?: AudioManager;
    private editingVolume = false;
    private volumeEditType: 'master' | 'music' | 'soundEffects' | null = null;

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

    setAudioManager(audioManager: AudioManager): void {
        this.audioManager = audioManager;
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

    private playerHPBar?: Phaser.GameObjects.Graphics;
    private playerHPText?: Phaser.GameObjects.Text;
    private playerHPValueText?: Phaser.GameObjects.Text;

    private createHUD(): void {
        // Score and timer display (right side)
        this.scoreText = this.scene.add.text(GAME_CONFIG.WIDTH - 20, 10, 'Score: 0  Time: 60s', {
            fontSize: UI_CONFIG.FONT_SIZE_SMALL,
            color: '#ffffff',
            align: 'right'
        });
        this.scoreText.setOrigin(1, 0); // Right-aligned
        this.scoreText.setScrollFactor(0);

        // Player HP label (left side)
        this.playerHPText = this.scene.add.text(20, 10, 'HP:', {
            fontSize: UI_CONFIG.FONT_SIZE_SMALL,
            color: '#ffffff',
        });
        this.playerHPText.setScrollFactor(0);

        // Player HP bar
        this.playerHPBar = this.scene.add.graphics();
        this.playerHPBar.setScrollFactor(0);

        // HP value text inside the bar
        this.playerHPValueText = this.scene.add.text(0, 0, '100/100', {
            fontSize: UI_CONFIG.FONT_SIZE_SMALL,
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.playerHPValueText.setOrigin(0.5, 0.5); // Center the text
        this.playerHPValueText.setScrollFactor(0);

        this.updatePlayerHPBar(100, 100); // Initialize with full HP
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

    updatePlayerHP(currentHP: number, maxHP: number): void {
        // Update HP value text inside the bar
        if (this.playerHPValueText) {
            this.playerHPValueText.setText(`${currentHP}/${maxHP}`);
        }
        
        // Update HP bar
        this.updatePlayerHPBar(currentHP, maxHP);
    }

    private updatePlayerHPBar(currentHP: number, maxHP: number): void {
        if (!this.playerHPBar || !this.playerHPValueText) return;

        const barWidth = 180; // Made 1.5x longer
        const barHeight = 20; // Height to fit text
        const barX = 70; // Position after "HP:" text (moved right again)
        const barY = 8; // Align with HP text

        // Clear previous drawing
        this.playerHPBar.clear();

        // Background (dark red - missing health)
        this.playerHPBar.fillStyle(0x330000, 0.8);
        this.playerHPBar.fillRect(barX, barY, barWidth, barHeight);

        // Foreground (current health)
        const healthPercentage = currentHP / maxHP;
        const healthWidth = barWidth * healthPercentage;
        
        // Color changes based on health percentage
        let healthColor = 0x00ff00; // Green
        if (healthPercentage < 0.3) {
            healthColor = 0xff0000; // Red
        } else if (healthPercentage < 0.6) {
            healthColor = 0xffaa00; // Orange
        }

        this.playerHPBar.fillStyle(healthColor, 0.9);
        this.playerHPBar.fillRect(barX, barY, healthWidth, barHeight);

        // Border
        this.playerHPBar.lineStyle(1, 0xffffff, 0.8);
        this.playerHPBar.strokeRect(barX, barY, barWidth, barHeight);

        // Position the HP value text in the center of the bar
        this.playerHPValueText.setPosition(barX + barWidth / 2, barY + barHeight / 2);
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

        // No initial selection - user must navigate first
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

        // No initial selection - user must navigate first
    }

    showPauseMenu(onResume: () => void, onReturnToMenu: () => void): void {
        this.clearScreens();
        this.showingConfirmation = false;

        // Store callbacks
        this.pauseCallbacks.onResume = onResume;
        this.pauseCallbacks.onReturnToMenu = onReturnToMenu;

        // Reset menu state
        this.menuItems = [];
        this.menuCallbacks = [
            onResume,
            () => this.showSettingsMenu(() => this.showPauseMenu(onResume, onReturnToMenu)),
            () => this.showExitConfirmation(),
        ];
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
            { text: 'RESUME GAME', y: -40 },
            { text: 'SETTINGS', y: 0 },
            { text: 'RETURN TO MENU', y: 40 },
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

        // No initial selection - user must navigate first
    }

    private showExitConfirmation(): void {
        this.clearScreens();
        this.showingConfirmation = true;

        // Reset menu state
        this.menuItems = [];
        this.menuCallbacks = [
            () =>
                this.showPauseMenu(
                    this.pauseCallbacks.onResume!,
                    this.pauseCallbacks.onReturnToMenu!
                ),
            this.pauseCallbacks.onReturnToMenu!,
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

        // No initial selection - user must navigate first
    }

    showSettingsMenu(onBack: () => void): void {
        this.clearScreens();
        this.showingSettings = true;
        this.settingsCallback = onBack;
        this.editingVolume = false;
        this.volumeEditType = null;

        if (!this.audioManager) {
            console.warn('AudioManager not set, cannot show settings');
            onBack();
            return;
        }

        const settings = this.audioManager.getVolumeSettings();

        // Reset menu state
        this.menuItems = [];
        this.menuCallbacks = [
            () => {
                this.editVolume('master');
            },
            () => {
                this.editVolume('music');
            },
            () => {
                this.editVolume('soundEffects');
            },
            () => {
                onBack();
            },
        ];
        this.selectedIndex = -1; // No item selected initially

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

        // Settings title
        const titleText = this.scene.add
            .text(0, -160, 'VOLUME SETTINGS', {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#44ff44',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(titleText);

        // Create menu items with current values
        const menuOptions = [
            { text: `Master Volume: ${Math.round(settings.master * 100)}%`, y: -60 },
            { text: `Background Music: ${Math.round(settings.music * 100)}%`, y: -10 },
            { text: `Sound Effects: ${Math.round(settings.soundEffects * 100)}%`, y: 40 },
            { text: 'BACK', y: 100 },
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
                if (!this.editingVolume) {
                    this.selectedIndex = index;
                    this.updateMenuSelection();
                }
            });
            menuItem.on('pointerdown', () => {
                if (!this.editingVolume) {
                    this.menuCallbacks[index]();
                }
            });

            this.menuItems.push(menuItem);
            this.uiOverlay!.add(menuItem);
        });

        // Control hints
        const controlHint = this.scene.add
            .text(0, 150, 'W/S to navigate | ENTER to edit | ESC to go back', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(controlHint);

        this.uiOverlay.setScrollFactor(0);

        // No initial selection - user must navigate first
    }

    private editVolume(type: 'master' | 'music' | 'soundEffects'): void {
        if (!this.audioManager) return;

        this.editingVolume = true;
        this.volumeEditType = type;

        // Update the menu item to show editing state
        const settings = this.audioManager.getVolumeSettings();
        const volumeNames = {
            master: 'Master Volume',
            music: 'Background Music',
            soundEffects: 'Sound Effects',
        };

        const currentValue = settings[type];
        const displayValue = Math.round(currentValue * 100);
        const menuText = `> ${volumeNames[type]}: ${displayValue}% <`;

        // Update the text of the current menu item
        this.menuItems[this.selectedIndex].setText(menuText);
        this.menuItems[this.selectedIndex].setColor('#ffff00'); // Yellow when editing

        // Update control hints
        const controlHint = this.scene.add
            .text(0, 150, 'W/S to adjust volume | ENTER to confirm | ESC to cancel', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#ffff00',
                align: 'center',
            })
            .setOrigin(0.5);

        // Remove old hint and add new one
        const oldHint = this.uiOverlay!.list.find(
            (child) =>
                child instanceof Phaser.GameObjects.Text && child.text.includes('W/S to navigate')
        ) as Phaser.GameObjects.Text;
        if (oldHint) {
            oldHint.destroy();
        }

        this.uiOverlay!.add(controlHint);
    }

    private confirmVolumeEdit(): void {
        this.editingVolume = false;
        this.volumeEditType = null;

        // Refresh the settings menu to show updated values
        if (this.settingsCallback) {
            this.showSettingsMenu(this.settingsCallback);
        }
    }

    private cancelVolumeEdit(): void {
        this.editingVolume = false;
        this.volumeEditType = null;

        // Refresh the settings menu to show original values
        if (this.settingsCallback) {
            this.showSettingsMenu(this.settingsCallback);
        }
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
        this.showingSettings = false;
        this.editingVolume = false;
        this.volumeEditType = null;
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
            if (this.selectedIndex !== -1 && index === this.selectedIndex) {
                item.setColor('#00ff00');
                item.setScale(1.1);
            } else {
                item.setColor('#ffffff');
                item.setScale(1.0);
            }
        });
    }

    private handleMenuNavigation(): void {
        // Special handling for volume editing mode
        if (this.editingVolume && this.volumeEditType && this.audioManager) {
            const currentSettings = this.audioManager.getVolumeSettings();
            const currentValue = currentSettings[this.volumeEditType];
            let newValue = currentValue;

            // Adjust volume with W/S keys
            if (
                Phaser.Input.Keyboard.JustDown(this.cursors.up!) ||
                Phaser.Input.Keyboard.JustDown(this.wKey)
            ) {
                newValue = Math.min(1.0, currentValue + 0.05); // Increase by 5%
            }

            if (
                Phaser.Input.Keyboard.JustDown(this.cursors.down!) ||
                Phaser.Input.Keyboard.JustDown(this.sKey)
            ) {
                newValue = Math.max(0.0, currentValue - 0.05); // Decrease by 5%
            }

            // Apply volume change
            if (newValue !== currentValue) {
                if (this.volumeEditType === 'master') {
                    this.audioManager.setMasterVolume(newValue);
                } else if (this.volumeEditType === 'music') {
                    this.audioManager.setMusicVolume(newValue);
                } else if (this.volumeEditType === 'soundEffects') {
                    this.audioManager.setSoundEffectsVolume(newValue);
                    // Play test sound for sound effects
                    this.audioManager.playShotSound();
                }

                // Update display
                const volumeNames = {
                    master: 'Master Volume',
                    music: 'Background Music',
                    soundEffects: 'Sound Effects',
                };
                const displayValue = Math.round(newValue * 100);
                const menuText = `> ${volumeNames[this.volumeEditType]}: ${displayValue}% <`;
                this.menuItems[this.selectedIndex].setText(menuText);
            }

            // Handle confirmation/cancellation
            if (this.isEnterPressed()) {
                this.confirmVolumeEdit();
            } else if (this.isEscPressed()) {
                this.cancelVolumeEdit();
            }

            return; // Skip normal navigation while editing volume
        }

        // Normal menu navigation
        if (
            Phaser.Input.Keyboard.JustDown(this.cursors.up!) ||
            Phaser.Input.Keyboard.JustDown(this.wKey)
        ) {
            if (this.selectedIndex === -1) {
                // First navigation - select first item
                this.selectedIndex = 0;
            } else {
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            }
            this.updateMenuSelection();
        }

        if (
            Phaser.Input.Keyboard.JustDown(this.cursors.down!) ||
            Phaser.Input.Keyboard.JustDown(this.sKey)
        ) {
            if (this.selectedIndex === -1) {
                // First navigation - select first item
                this.selectedIndex = 0;
            } else {
                this.selectedIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
            }
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
            } else if (this.showingSettings) {
                // In settings menu, ESC means "go back"
                this.menuCallbacks[this.menuCallbacks.length - 1](); // Last option is always "BACK"
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
        
        // Clean up HP bar
        if (this.playerHPBar) {
            this.playerHPBar.destroy();
            this.playerHPBar = undefined;
        }
        
        if (this.playerHPText) {
            this.playerHPText.destroy();
            this.playerHPText = undefined;
        }
        
        if (this.playerHPValueText) {
            this.playerHPValueText.destroy();
            this.playerHPValueText = undefined;
        }
    }
}
