import 'phaser';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';

export class ControlsScene extends Phaser.Scene {
    private backgroundTileSprite?: Phaser.GameObjects.TileSprite;

    constructor() {
        super({ key: 'ControlsScene' });
    }

    preload(): void {
        this.load.image('background', 'assets/background.png');
    }

    create(): void {
        // Create scrolling background
        this.backgroundTileSprite = this.add.tileSprite(
            0,
            0,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            'background'
        );
        this.backgroundTileSprite.setOrigin(0, 0);

        // Title
        const title = this.add.text(GAME_CONFIG.WIDTH / 2, 100, 'GAME CONTROLS', {
            fontSize: UI_CONFIG.FONT_SIZE_LARGE,
            color: '#00ff00',
            fontFamily: 'monospace',
            align: 'center',
        });
        title.setOrigin(0.5);

        // Controls information
        const controlsText = [
            'THREE-KEY DESIGN',
            '',
            'UP: W or ↑ Arrow',
            'DOWN: S or ↓ Arrow',
            'ACTION: ENTER, SPACE, or ESC',
            '',
            'These three controls work everywhere:',
            '• In-game: Move ship up/down + auto-fire',
            '• In menus: Navigate + select/return',
            '',
            "That's it! Simple and effective.",
        ];

        controlsText.forEach((line, index) => {
            const y = 180 + index * 22;
            let color = '#ffffff';
            let fontSize = '16px';

            // Style different types of text
            if (line.includes(':') && !line.startsWith('•')) {
                color = '#00ff00';
                fontSize = '20px';
            } else if (line.startsWith('•')) {
                color = '#ffff00';
            } else if (line.includes('Three-Key Design')) {
                color = '#ff6600';
                fontSize = '18px';
            }

            this.add
                .text(GAME_CONFIG.WIDTH / 2, y, line, {
                    fontSize: fontSize,
                    color: color,
                    fontFamily: 'monospace',
                    align: 'center',
                })
                .setOrigin(0.5);
        });

        // Back button
        const backButton = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT - 60,
            'PRESS ENTER/SPACE/ESC OR CLICK TO RETURN',
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#ffffff',
                fontFamily: 'monospace',
                align: 'center',
            }
        );
        backButton.setOrigin(0.5);
        backButton.setInteractive();

        // Pulsing effect for back button
        this.tweens.add({
            targets: backButton,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Input handling
        backButton.on('pointerdown', () => this.returnToMenu());

        // Set up key handling
        const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        enterKey.on('down', () => this.returnToMenu());
        spaceKey.on('down', () => this.returnToMenu());
        escKey.on('down', () => this.returnToMenu());
    }

    update(): void {
        // Scroll background
        if (this.backgroundTileSprite) {
            this.backgroundTileSprite.tilePositionX += GAME_CONFIG.BACKGROUND_SCROLL_SPEED;
        }
    }

    private returnToMenu(): void {
        this.scene.switch('MainMenuScene');
    }
}
