import {
    GAME_CONFIG,
    UI_CONFIG,
    UPGRADE_DEFINITIONS,
    UPGRADE_CONFIG,
    UpgradeData,
} from './config/constants';
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
    private upgradeIconFrames: Phaser.GameObjects.Graphics[] = [];

    // Pause system
    private pauseCallbacks: {
        onResume?: () => void;
        onReturnToMenu?: () => void;
    } = {};
    private showingConfirmation = false;

    // Settings system
    private showingSettings = false;
    private settingsCallback?: () => void;

    // Active upgrades screen state
    private showingActiveUpgrades = false;
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
    private rKey!: Phaser.Input.Keyboard.Key;

    // Upgrade system
    private upgradeCallback?: (upgradeId: string) => void;
    private showingUpgradeScreen = false;

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

        // Add R key for upgrade reroll
        this.rKey = this.scene.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R)!;
    }

    private playerHPBar?: Phaser.GameObjects.Graphics;
    private playerHPText?: Phaser.GameObjects.Text;
    private playerHPValueText?: Phaser.GameObjects.Text;

    private createHUD(): void {
        // Score and timer display (right side)
        this.scoreText = this.scene.add.text(GAME_CONFIG.WIDTH - 20, 10, 'Score: 0  Time: 60s', {
            fontSize: UI_CONFIG.FONT_SIZE_SMALL,
            color: '#ffffff',
            align: 'right',
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
            fontStyle: 'bold',
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
    updateHUD(score: number, timeLeft: number, currentWave?: number, totalWaves?: number): void {
        let timeText = `Score: ${score}  Time: ${Math.ceil(timeLeft / 1000)}s`;

        // Add wave information if provided
        if (currentWave !== undefined && totalWaves !== undefined) {
            timeText = `Wave: ${currentWave}/${totalWaves}  ${timeText}`;
        }

        this.scoreText.setText(timeText);
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
        if (this.menuItems.length > 0 || this.showingActiveUpgrades) {
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

        // Create overlay
        this.uiOverlay = this.scene.add.container(0, 0);

        // Semi-transparent background
        const overlay = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            0x000000,
            UI_CONFIG.OVERLAY_ALPHA
        );
        this.uiOverlay.add(overlay);

        // Victory title
        const title = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 150,
            'VICTORY!',
            {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#00ff00',
                fontStyle: 'bold',
            }
        );
        title.setOrigin(0.5);
        this.uiOverlay.add(title);

        // Score display
        const scoreDisplay = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 80,
            `Final Score: ${score}`,
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        scoreDisplay.setOrigin(0.5);
        this.uiOverlay.add(scoreDisplay);

        // Menu options
        const restartText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 20,
            'Play Again',
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        restartText.setOrigin(0.5);
        this.menuItems.push(restartText);

        const menuText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 80,
            'Return to Menu',
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        menuText.setOrigin(0.5);
        this.uiOverlay.add(menuText);
        this.menuItems.push(menuText);

        // Set initial selection
        this.selectedIndex = 0;
        this.updateMenuSelection();
    }

    showWaveVictory(
        wave: number,
        score: number,
        onNextWave: () => void,
        onReturnToMenu: () => void
    ): void {
        this.clearScreens();

        // Reset menu state
        this.menuItems = [];
        this.menuCallbacks = [onNextWave, onReturnToMenu];

        // Create overlay
        this.uiOverlay = this.scene.add.container(0, 0);

        // Semi-transparent background
        const overlay = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            0x000000,
            UI_CONFIG.OVERLAY_ALPHA
        );
        this.uiOverlay.add(overlay);

        // Wave completion title
        const title = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 150,
            `WAVE ${wave} CLEARED!`,
            {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#00ff00',
                fontStyle: 'bold',
            }
        );
        title.setOrigin(0.5);
        this.uiOverlay.add(title);

        // Score display
        const scoreDisplay = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 80,
            `Score: ${score}`,
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        scoreDisplay.setOrigin(0.5);
        this.uiOverlay.add(scoreDisplay);

        // Menu options
        const nextWaveText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 20,
            'Continue to Next Wave',
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        nextWaveText.setOrigin(0.5);
        this.uiOverlay.add(nextWaveText);
        this.menuItems.push(nextWaveText);

        const menuText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 80,
            'Return to Menu',
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        menuText.setOrigin(0.5);
        this.uiOverlay.add(menuText);
        this.menuItems.push(menuText);

        // Set initial selection
        this.selectedIndex = 0;
        this.updateMenuSelection();
    }

    showFinalVictory(score: number, onRestart: () => void, onReturnToMenu: () => void): void {
        this.clearScreens();

        // Reset menu state
        this.menuItems = [];
        this.menuCallbacks = [onRestart, onReturnToMenu];

        // Create overlay
        this.uiOverlay = this.scene.add.container(0, 0);

        // Semi-transparent background
        const overlay = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            0x000000,
            UI_CONFIG.OVERLAY_ALPHA
        );
        this.uiOverlay.add(overlay);

        // Final victory title
        const title = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 150,
            'ALL WAVES CLEARED!',
            {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#ffff00',
                fontStyle: 'bold',
            }
        );
        title.setOrigin(0.5);
        this.uiOverlay.add(title);

        // Subtitle
        const subtitle = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 100,
            'COMPLETE VICTORY!',
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#00ff00',
                fontStyle: 'bold',
            }
        );
        subtitle.setOrigin(0.5);
        this.uiOverlay.add(subtitle);

        // Score display
        const scoreDisplay = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 50,
            `Final Score: ${score}`,
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        scoreDisplay.setOrigin(0.5);
        this.uiOverlay.add(scoreDisplay);

        // Menu options
        const restartText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 20,
            'Play Again',
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        restartText.setOrigin(0.5);
        this.uiOverlay.add(restartText);
        this.menuItems.push(restartText);

        const menuText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 80,
            'Return to Menu',
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        menuText.setOrigin(0.5);
        this.uiOverlay.add(menuText);
        this.menuItems.push(menuText);

        // Set initial selection
        this.selectedIndex = 0;
        this.updateMenuSelection();
    }

    showUpgradeScreen(onUpgradeSelected: (upgradeId: string) => void): void {
        // Clear any existing overlays
        this.clearScreens();

        // Store callback and set flag for upgrade screen
        this.upgradeCallback = onUpgradeSelected;
        this.showingUpgradeScreen = true;

        // Create dark overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, UI_CONFIG.OVERLAY_ALPHA);
        overlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        overlay.setScrollFactor(0);

        // Container for upgrade screen
        this.uiOverlay = this.scene.add.container(0, 0);
        this.uiOverlay.add(overlay);
        this.uiOverlay.setScrollFactor(0);

        // Title
        const title = this.scene.add.text(GAME_CONFIG.WIDTH / 2, 120, 'WAVE CLEARED!', {
            fontSize: UI_CONFIG.FONT_SIZE_LARGE,
            color: '#44ff44', // Green color for success
            align: 'center',
        });
        title.setOrigin(0.5);
        this.uiOverlay.add(title);

        // Subtitle
        const subtitle = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            180,
            'Excellent work! Choose an upgrade to enhance your ship',
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#cccccc',
                align: 'center',
            }
        );
        subtitle.setOrigin(0.5);
        this.uiOverlay.add(subtitle);

        // Additional solid background for upgrade menu area
        const menuBackground = this.scene.add.graphics();
        menuBackground.fillStyle(0x000000, 0.9); // More opaque background for menu area
        const menuAreaY = 200; // Start well above first upgrade item
        const menuAreaHeight = 420; // Cover all upgrade items
        menuBackground.fillRect(
            GAME_CONFIG.WIDTH / 2 - 400, // Left edge
            menuAreaY, // Top edge
            800, // Width
            menuAreaHeight // Height
        );
        this.uiOverlay.add(menuBackground);

        // Create upgrade items
        this.menuItems = [];
        this.menuCallbacks = [];
        this.upgradeIconFrames = [];

        const startY = 260;
        const itemSpacing = 90;

        // Get 4 random upgrades instead of all upgrades
        const randomUpgrades = (this.scene as any).upgradeManager.getRandomUpgrades(4);
        randomUpgrades.forEach((upgrade, index) => {
            const y = startY + index * itemSpacing;
            const iconX = GAME_CONFIG.WIDTH / 2 - 200;

            // Upgrade icon
            const icon = this.scene.add.image(iconX, y, upgrade.icon);
            icon.setScale(UPGRADE_CONFIG.ICON_SCALE);
            this.uiOverlay.add(icon);

            // Icon frame (border around icon)
            const iconSize = 128 * UPGRADE_CONFIG.ICON_SCALE; // Calculate actual icon size
            const frameThickness = 3;
            const frameOffset = iconSize / 2 + frameThickness / 2;

            const iconFrame = this.scene.add.graphics();
            iconFrame.lineStyle(frameThickness, 0x666666, 1); // Default gray color
            iconFrame.strokeRect(
                iconX - frameOffset,
                y - frameOffset,
                iconSize + frameThickness,
                iconSize + frameThickness
            );
            this.uiOverlay.add(iconFrame);
            this.upgradeIconFrames.push(iconFrame);

            // Upgrade name
            const nameText = this.scene.add.text(
                GAME_CONFIG.WIDTH / 2 - 100,
                y - 20,
                upgrade.name,
                {
                    fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                    color: '#ffffff',
                    fontStyle: 'bold',
                }
            );
            nameText.setOrigin(0, 0.5);
            this.uiOverlay.add(nameText);

            // Upgrade description
            const descText = this.scene.add.text(
                GAME_CONFIG.WIDTH / 2 - 100,
                y + 15,
                upgrade.description,
                {
                    fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                    color: '#cccccc',
                }
            );
            descText.setOrigin(0, 0.5);
            this.uiOverlay.add(descText);

            // Store for menu navigation
            this.menuItems.push(nameText);
            this.menuCallbacks.push(() => onUpgradeSelected(upgrade.id));
        });

        // Instructions
        const instructionText = 'W/S to navigate, ENTER to select';
        
        const instructions = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT - 80,
            instructionText,
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            }
        );
        instructions.setOrigin(0.5);
        this.uiOverlay.add(instructions);

        this.selectedIndex = 0;
        this.updateMenuSelection();
    }

    private rerollUpgrades(): void {
        if (!this.upgradeCallback || !this.showingUpgradeScreen) {
            return;
        }

        // Clear existing items
        if (this.uiOverlay) {
            this.uiOverlay.destroy();
        }

        // Recreate the upgrade screen with new random upgrades
        this.showUpgradeScreen(this.upgradeCallback);
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
            () => this.showActiveUpgrades(() => this.showPauseMenu(onResume, onReturnToMenu)),
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
            { text: 'RESUME GAME', y: -60 },
            { text: 'ACTIVE UPGRADES', y: -20 },
            { text: 'SETTINGS', y: 20 },
            { text: 'RETURN TO MENU', y: 60 },
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
            .text(0, 100, 'W/S to navigate | ENTER to select', {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5);
        this.uiOverlay.add(controlHint);

        this.uiOverlay.setScrollFactor(0);

        // No initial selection - user must navigate first
    }

    showActiveUpgrades(onBack: () => void): void {
        this.clearScreens();
        this.showingActiveUpgrades = true;

        // Get active upgrades from the upgrade manager
        const scene = this.scene as any;
        const upgradeManager = scene.upgradeManager;
        if (!upgradeManager) {
            // If no upgrade manager, just go back
            onBack();
            return;
        }

        const activeUpgradeIds = upgradeManager.getActiveUpgrades();
        const allUpgrades = upgradeManager.getAvailableUpgrades(); // This returns ALL upgrade definitions

        // Filter to get active upgrade data
        const activeUpgrades = allUpgrades.filter(upgrade => activeUpgradeIds.includes(upgrade.id));

        // Create dark overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, UI_CONFIG.OVERLAY_ALPHA);
        overlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        overlay.setScrollFactor(0);

        // Container for upgrade screen
        this.uiOverlay = this.scene.add.container(0, 0);
        this.uiOverlay.add(overlay);
        this.uiOverlay.setScrollFactor(0);

        // Title
        const title = this.scene.add.text(GAME_CONFIG.WIDTH / 2, 100, 'ACTIVE UPGRADES', {
            fontSize: UI_CONFIG.FONT_SIZE_LARGE,
            color: '#ffffff',
            align: 'center',
        });
        title.setOrigin(0.5);
        this.uiOverlay.add(title);

        // Check if player has any upgrades
        if (activeUpgrades.length === 0) {
            // No upgrades message
            const noUpgradesText = this.scene.add.text(
                GAME_CONFIG.WIDTH / 2,
                GAME_CONFIG.HEIGHT / 2,
                'No upgrades active yet.\nComplete waves to unlock upgrades!',
                {
                    fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                    color: '#cccccc',
                    align: 'center',
                }
            );
            noUpgradesText.setOrigin(0.5);
            this.uiOverlay.add(noUpgradesText);
        } else {
            // Subtitle
            const subtitle = this.scene.add.text(
                GAME_CONFIG.WIDTH / 2,
                140,
                `${activeUpgrades.length} upgrades active`,
                {
                    fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                    color: '#cccccc',
                    align: 'center',
                }
            );
            subtitle.setOrigin(0.5);
            this.uiOverlay.add(subtitle);

            // Create upgrade grid (2 columns, 4 rows maximum)
            const startY = 200;
            const itemHeight = 100;
            const columnWidth = 600;
            const leftColumnX = GAME_CONFIG.WIDTH / 2 - columnWidth / 2;
            const rightColumnX = GAME_CONFIG.WIDTH / 2 + columnWidth / 2;

            activeUpgrades.forEach((upgrade, index) => {
                const isLeftColumn = index % 2 === 0;
                const row = Math.floor(index / 2);
                const x = isLeftColumn ? leftColumnX : rightColumnX;
                const y = startY + row * itemHeight;

                // Upgrade icon
                const iconX = x - 150;
                const icon = this.scene.add.image(iconX, y, upgrade.icon);
                icon.setScale(0.4); // Smaller icons for compact display
                this.uiOverlay.add(icon);

                // Icon frame
                const iconSize = 128 * 0.4;
                const frameThickness = 2;
                const frameOffset = iconSize / 2 + frameThickness / 2;

                const iconFrame = this.scene.add.graphics();
                iconFrame.lineStyle(frameThickness, 0x666666, 1);
                iconFrame.strokeRect(
                    iconX - frameOffset,
                    y - frameOffset,
                    iconSize + frameThickness,
                    iconSize + frameThickness
                );
                this.uiOverlay.add(iconFrame);

                // Upgrade name
                const nameText = this.scene.add.text(
                    x - 100,
                    y - 10,
                    upgrade.name,
                    {
                        fontSize: '20px',
                        color: '#ffffff',
                        fontStyle: 'bold',
                    }
                );
                nameText.setOrigin(0, 0.5);
                this.uiOverlay.add(nameText);

                // Upgrade description
                const descText = this.scene.add.text(
                    x - 100,
                    y + 15,
                    upgrade.description,
                    {
                        fontSize: '16px',
                        color: '#cccccc',
                    }
                );
                descText.setOrigin(0, 0.5);
                this.uiOverlay.add(descText);
            });
        }

        // Back instruction
        const backInstruction = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT - 60,
            'ENTER to return to pause menu',
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#888888',
                align: 'center',
            }
        );
        backInstruction.setOrigin(0.5);
        this.uiOverlay.add(backInstruction);

        // Set up simple menu for back action
        this.menuItems = []; // No selectable items, just waiting for Enter
        this.menuCallbacks = [onBack];
        this.selectedIndex = 0;
    }

    showRebirth(wave: number, onRestartWave: () => void, onReturnToMenu: () => void): void {
        this.clearScreens();

        // Reset menu state
        this.menuItems = [];
        this.menuCallbacks = [onRestartWave, onReturnToMenu];

        // Create overlay
        this.uiOverlay = this.scene.add.container(0, 0);

        // Semi-transparent background
        const overlay = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            0x000000,
            UI_CONFIG.OVERLAY_ALPHA
        );
        this.uiOverlay.add(overlay);

        // Rebirth title
        const title = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 150,
            'REBIRTH ACTIVATED!',
            {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#ffaa00',
                fontStyle: 'bold',
            }
        );
        title.setOrigin(0.5);
        this.uiOverlay.add(title);

        // Subtitle
        const subtitle = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 100,
            'Rebirth upgrade consumed',
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ff8844',
            }
        );
        subtitle.setOrigin(0.5);
        this.uiOverlay.add(subtitle);

        // Wave restart message
        const waveMessage = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 50,
            `Wave ${wave} will restart`,
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        waveMessage.setOrigin(0.5);
        this.uiOverlay.add(waveMessage);

        // Menu options
        const restartText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 20,
            'Restart Wave',
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        restartText.setOrigin(0.5);
        this.uiOverlay.add(restartText);
        this.menuItems.push(restartText);

        const menuText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 80,
            'Return to Menu',
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
            }
        );
        menuText.setOrigin(0.5);
        this.uiOverlay.add(menuText);
        this.menuItems.push(menuText);

        // Set initial selection
        this.selectedIndex = 0;
        this.updateMenuSelection();
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
        this.upgradeIconFrames = [];
        this.selectedIndex = 0;
        this.showingConfirmation = false;
        this.showingSettings = false;
        this.showingActiveUpgrades = false;
        this.editingVolume = false;
        this.volumeEditType = null;
        // Clear upgrade screen state
        this.showingUpgradeScreen = false;
        this.upgradeCallback = undefined;
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

                // Update upgrade icon frame color if available
                if (this.upgradeIconFrames[index]) {
                    this.upgradeIconFrames[index].clear();
                    const iconSize = 128 * UPGRADE_CONFIG.ICON_SCALE;
                    const frameThickness = 4; // Slightly thicker when selected
                    const frameOffset = iconSize / 2 + frameThickness / 2;
                    const iconX = GAME_CONFIG.WIDTH / 2 - 200;
                    const y = 260 + index * 90; // Match positions from showUpgradeScreen

                    this.upgradeIconFrames[index].lineStyle(frameThickness, 0x00ff00, 1); // Green when selected
                    this.upgradeIconFrames[index].strokeRect(
                        iconX - frameOffset,
                        y - frameOffset,
                        iconSize + frameThickness,
                        iconSize + frameThickness
                    );
                }
            } else {
                item.setColor('#ffffff');
                item.setScale(1.0);

                // Update upgrade icon frame color if available
                if (this.upgradeIconFrames[index]) {
                    this.upgradeIconFrames[index].clear();
                    const iconSize = 128 * UPGRADE_CONFIG.ICON_SCALE;
                    const frameThickness = 3; // Normal thickness
                    const frameOffset = iconSize / 2 + frameThickness / 2;
                    const iconX = GAME_CONFIG.WIDTH / 2 - 200;
                    const y = 260 + index * 90; // Match positions from showUpgradeScreen

                    this.upgradeIconFrames[index].lineStyle(frameThickness, 0x666666, 1); // Gray when not selected
                    this.upgradeIconFrames[index].strokeRect(
                        iconX - frameOffset,
                        y - frameOffset,
                        iconSize + frameThickness,
                        iconSize + frameThickness
                    );
                }
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
            if (this.showingActiveUpgrades) {
                // In active upgrades screen, Enter always goes back
                this.menuCallbacks[0]();
            } else if (this.selectedIndex >= 0 && this.selectedIndex < this.menuCallbacks.length) {
                this.menuCallbacks[this.selectedIndex]();
            }
        }

        // Handle ESC key differently based on context
        if (this.isEscPressed() && this.menuCallbacks.length > 0) {
            if (this.showingConfirmation) {
                // In confirmation dialog, ESC means "NO, cancel the exit"
                this.menuCallbacks[0](); // First option is always "NO, CONTINUE PLAYING"
            } else if (this.showingSettings) {
                // In settings menu, ESC means "go back"
                this.menuCallbacks[this.menuCallbacks.length - 1](); // Last option is always "BACK"
            } else if (this.showingActiveUpgrades) {
                // In active upgrades screen, ESC means "go back"
                this.menuCallbacks[0](); // Only callback is the back function
            } else if (this.menuCallbacks.length > 1) {
                // In other menus, ESC means "go to menu" (second option)
                this.menuCallbacks[1](); // Return to menu is always second option
            }
        }

        // Handle R key for upgrade reroll (debug mode only)
        if (this.showingUpgradeScreen && Phaser.Input.Keyboard.JustDown(this.rKey)) {
            // Check if debug mode is enabled by checking if debugGraphic exists
            const scene = this.scene as any;
            if (scene.physics && scene.physics.world && scene.physics.world.debugGraphic) {
                console.log('[DEBUG] Rerolling upgrades...');
                this.rerollUpgrades();
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

    hideOverlays(): void {
        this.clearScreens();
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
