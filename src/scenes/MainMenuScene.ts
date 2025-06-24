import 'phaser';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';
import { AudioManager } from '../AudioManager';
import { GameUI } from '../GameUI';

export class MainMenuScene extends Phaser.Scene {
    private backgroundTileSprite?: Phaser.GameObjects.TileSprite;
    private title?: Phaser.GameObjects.Text;
    private subtitle?: Phaser.GameObjects.Text;
    private menuItems: Phaser.GameObjects.Text[] = [];
    private selectedIndex: number = 0;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys?: { [key: string]: Phaser.Input.Keyboard.Key };
    private audioManager!: AudioManager;
    private gameUI?: GameUI;
    private showingSettings: boolean = false;

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload(): void {
        // Load assets for menu
        this.load.image('background', 'assets/images/background.png');
        this.load.image('player', 'assets/images/player.png');

        // Load audio assets
        AudioManager.preload(this);
    }

    create(): void {
        // Reset menu items array
        this.menuItems = [];
        this.selectedIndex = 0;

        // Initialize audio manager and start menu music
        this.audioManager = new AudioManager(this);
        this.audioManager.playMenuMusic();

        // Initialize GameUI for settings (without HUD)
        this.gameUI = new GameUI(this);
        this.gameUI.createForMenu();
        this.gameUI.setAudioManager(this.audioManager);

        // Add scene resume handler to restart music when returning from game
        this.scene.scene.events.on('resume', () => {
            if (this.audioManager && !this.audioManager.isMusicPlaying()) {
                this.audioManager.playMenuMusic();
            }
        });

        // Create scrolling background
        this.backgroundTileSprite = this.add.tileSprite(
            0,
            0,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            'background'
        );
        this.backgroundTileSprite.setOrigin(0, 0);

        // Add floating player ship as decoration
        const decorativeShip = this.add.image(200, 150, 'player');
        decorativeShip.setScale(0.6);
        decorativeShip.setAlpha(0.7);

        // Gentle floating animation
        this.tweens.add({
            targets: decorativeShip,
            y: decorativeShip.y + 20,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Game title
        this.title = this.add.text(GAME_CONFIG.WIDTH / 2, 150, 'SOLAR CRAWLER', {
            fontSize: '64px',
            color: '#00ff00',
            fontFamily: 'monospace',
            align: 'center',
        });
        this.title.setOrigin(0.5);

        // Subtitle
        this.subtitle = this.add.text(GAME_CONFIG.WIDTH / 2, 220, 'A Space Shooter Adventure', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'monospace',
            align: 'center',
        });
        this.subtitle.setOrigin(0.5);

        // Menu items
        const menuOptions = [
            { text: 'NEW GAME', action: () => this.startGame() },
            { text: 'SETTINGS', action: () => this.showSettings() },
            { text: 'CONTROLS', action: () => this.showControls() },
            { text: 'ABOUT', action: () => this.showAbout() },
            { text: 'CREDITS', action: () => this.showCredits() },
        ];

        // Create menu items
        menuOptions.forEach((option, index) => {
            const menuItem = this.add.text(GAME_CONFIG.WIDTH / 2, 350 + index * 60, option.text, {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#ffffff',
                fontFamily: 'monospace',
                align: 'center',
            });
            menuItem.setOrigin(0.5);
            menuItem.setInteractive();

            // Mouse hover effects
            menuItem.on('pointerover', () => {
                this.selectedIndex = index;
                this.updateMenuSelection();

                // Try to start music on mouse interaction
                if (this.audioManager) {
                    this.audioManager.retryPendingMusic();
                }
            });

            menuItem.on('pointerdown', () => {
                // Try to start music on mouse click
                if (this.audioManager) {
                    this.audioManager.retryPendingMusic();
                }
                option.action();
            });

            this.menuItems.push(menuItem);
        });

        // Set up input
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D') as {
            [key: string]: Phaser.Input.Keyboard.Key;
        };

        // Action keys (Enter, Space, ESC all work for selection)
        const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        enterKey.on('down', () => {
            // Don't process input if showing settings
            if (this.showingSettings) {
                return;
            }

            // Try to start music on key press
            if (this.audioManager) {
                this.audioManager.retryPendingMusic();
            }
            this.selectCurrentMenuItem();
        });
        spaceKey.on('down', () => {
            // Don't process input if showing settings
            if (this.showingSettings) {
                return;
            }

            // Try to start music on key press
            if (this.audioManager) {
                this.audioManager.retryPendingMusic();
            }
            this.selectCurrentMenuItem();
        });
        escKey.on('down', () => {
            // Don't process input if showing settings
            if (this.showingSettings) {
                return;
            }

            // Try to start music on key press
            if (this.audioManager) {
                this.audioManager.retryPendingMusic();
            }
            this.selectCurrentMenuItem();
        });

        // Initial selection - delay to ensure all objects are properly initialized
        this.time.delayedCall(50, () => {
            this.updateMenuSelection();
        });

        // Add universal click handler to activate audio on any interaction
        this.input.on('pointerdown', () => {
            if (this.audioManager) {
                this.audioManager.retryPendingMusic();
            }
        });
    }

    update(): void {
        // Try to start pending music on any user interaction
        if (this.audioManager && this.audioManager.hasPendingMusic()) {
            this.audioManager.retryPendingMusic();
        }

        // Scroll background
        if (this.backgroundTileSprite) {
            this.backgroundTileSprite.tilePositionX += GAME_CONFIG.BACKGROUND_SCROLL_SPEED;
        }

        // Update GameUI if showing settings
        if (this.showingSettings && this.gameUI) {
            this.gameUI.update();
            return; // Skip main menu navigation while showing settings
        }

        // Handle keyboard navigation
        if (this.cursors && this.wasdKeys) {
            if (
                Phaser.Input.Keyboard.JustDown(this.cursors.up!) ||
                Phaser.Input.Keyboard.JustDown(this.wasdKeys['W'])
            ) {
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                this.updateMenuSelection();

                // Try to start music on user interaction
                if (this.audioManager) {
                    this.audioManager.retryPendingMusic();
                }
            }

            if (
                Phaser.Input.Keyboard.JustDown(this.cursors.down!) ||
                Phaser.Input.Keyboard.JustDown(this.wasdKeys['S'])
            ) {
                this.selectedIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
                this.updateMenuSelection();

                // Try to start music on user interaction
                if (this.audioManager) {
                    this.audioManager.retryPendingMusic();
                }
            }
        }
    }

    private updateMenuSelection(): void {
        // Safety check to ensure menuItems exist and are valid
        if (!this.menuItems || this.menuItems.length === 0) {
            return;
        }

        this.menuItems.forEach((item, index) => {
            // Additional safety check for each item
            if (!item || !item.active) {
                return;
            }

            try {
                if (index === this.selectedIndex) {
                    item.setColor('#00ff00');
                    item.setScale(1.1);
                } else {
                    item.setColor('#ffffff');
                    item.setScale(1.0);
                }
            } catch (error) {
                console.error('Error updating menu item:', error);
            }
        });
    }

    private selectCurrentMenuItem(): void {
        // Safety check
        if (this.selectedIndex < 0 || this.selectedIndex >= this.menuItems.length) {
            return;
        }

        switch (this.selectedIndex) {
            case 0:
                this.startGame();
                break;
            case 1:
                this.showSettings();
                break;
            case 2:
                this.showControls();
                break;
            case 3:
                this.showAbout();
                break;
            case 4:
                this.showCredits();
                break;
        }
    }

    private startGame(): void {
        // Stop all audio before starting game
        AudioManager.stopAllAudio(this);

        // Clean up local audio manager
        if (this.audioManager) {
            this.audioManager.destroy();
        }
        this.scene.start('GameScene');
    }

    private showSettings(): void {
        // Prevent multiple calls
        if (this.showingSettings) {
            return;
        }

        if (!this.gameUI) {
            return;
        }

        this.showingSettings = true;

        // Hide main menu items
        this.menuItems.forEach((item) => item.setVisible(false));
        if (this.title) this.title.setVisible(false);
        if (this.subtitle) this.subtitle.setVisible(false);

        // Show settings menu
        this.gameUI.showSettingsMenu(() => this.hideSettings());
    }

    private hideSettings(): void {
        this.showingSettings = false;

        // Show main menu items again
        this.menuItems.forEach((item) => item.setVisible(true));
        if (this.title) this.title.setVisible(true);
        if (this.subtitle) this.subtitle.setVisible(true);

        // Clear GameUI overlays
        if (this.gameUI) {
            this.gameUI.clearScreens();
        }

        // Reset menu selection
        this.updateMenuSelection();
    }

    private showControls(): void {
        this.scene.switch('ControlsScene');
    }

    private showAbout(): void {
        this.scene.switch('AboutScene');
    }

    private showCredits(): void {
        this.scene.switch('CreditsScene');
    }

    destroy(): void {
        // Clean up audio
        if (this.audioManager) {
            this.audioManager.destroy();
        }

        // Clean up menu items
        this.menuItems = [];
    }
}
