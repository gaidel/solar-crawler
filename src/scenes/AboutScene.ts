import 'phaser';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';
import { AudioManager } from '../AudioManager';

export class AboutScene extends Phaser.Scene {
    private backgroundTileSprite?: Phaser.GameObjects.TileSprite;

    constructor() {
        super({ key: 'AboutScene' });
    }

    preload(): void {
        this.load.image('background', 'assets/images/background.png');
        AudioManager.preload(this);
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
        const title = this.add.text(GAME_CONFIG.WIDTH / 2, 100, 'ABOUT SOLAR CRAWLER', {
            fontSize: UI_CONFIG.FONT_SIZE_LARGE,
            color: '#00ff00',
            fontFamily: 'monospace',
            align: 'center',
        });
        title.setOrigin(0.5);

        // Game description
        const aboutText = [
            'Solar Crawler is a side-scrolling space shooter',
            'featuring the innovative Three-Key Design.',
            'Navigate through hostile space territories',
            'while battling various enemy types.',
            '',
            'Your mission: Survive for 60 seconds to achieve victory!',
            '',
            'FEATURES:',
            '• Three-Key Design for easy controls',
            '• Auto-firing combat system',
            '• Progressive difficulty scaling',
            '• Score-based progression',
            '• Survival-focused gameplay',
            '',
            'Version: 1.0.0',
            'Built with Phaser 3 and TypeScript',
        ];

        aboutText.forEach((line, index) => {
            const y = 200 + index * 25;
            const color = line.startsWith('•')
                ? '#ffff00'
                : line.includes(':')
                  ? '#00ff00'
                  : '#ffffff';

            this.add
                .text(GAME_CONFIG.WIDTH / 2, y, line, {
                    fontSize: '18px',
                    color: color,
                    fontFamily: 'monospace',
                    align: 'center',
                })
                .setOrigin(0.5);
        });

        // Back button
        const backButton = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT - 80,
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
