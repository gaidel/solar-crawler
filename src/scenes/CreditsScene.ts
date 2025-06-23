import 'phaser';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';
import { AudioManager } from '../AudioManager';

export class CreditsScene extends Phaser.Scene {
    private backgroundTileSprite?: Phaser.GameObjects.TileSprite;

    constructor() {
        super({ key: 'CreditsScene' });
    }

    preload(): void {
        this.load.image('background', 'assets/images/background.png');
        this.load.image('player', 'assets/images/player.png');
        this.load.image('asteroid', 'assets/images/enemies/asteroid.png');
        this.load.image('kamikaze', 'assets/images/enemies/kamikaze.png');
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

        // Add floating game assets as decoration
        this.createFloatingDecorations();

        // Title
        const title = this.add.text(GAME_CONFIG.WIDTH / 2, 80, 'CREDITS', {
            fontSize: UI_CONFIG.FONT_SIZE_LARGE,
            color: '#00ff00',
            fontFamily: 'monospace',
            align: 'center',
        });
        title.setOrigin(0.5);

        // Credits information
        const creditsText = [
            'SOLAR CRAWLER',
            '',
            'Created by',
            'Andrey Gaidel',
            '',
            'Special thanks to:',
            '',
            'Large Language Models',
            'and the academic community',
            'that develops them',
        ];

        creditsText.forEach((line, index) => {
            const y = 200 + index * 35;
            let color = '#ffffff';
            let fontSize = '18px';

            // Style different types of text
            if (line === 'SOLAR CRAWLER') {
                color = '#00ff00';
                fontSize = '48px';
            } else if (line === 'Andrey Gaidel') {
                color = '#ffff00';
                fontSize = '32px';
            } else if (line === 'Created by' || line === 'Special thanks to:') {
                color = '#00ff00';
                fontSize = '24px';
            } else if (line === 'Large Language Models') {
                color = '#ff6600';
                fontSize = '20px';
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

    private createFloatingDecorations(): void {
        // Add decorative sprites around the screen
        const decorations = [
            { sprite: 'player', x: 150, y: 200, scale: 0.4 },
            { sprite: 'asteroid', x: 1100, y: 250, scale: 0.3 },
            { sprite: 'kamikaze', x: 200, y: 500, scale: 0.3 },
            { sprite: 'player', x: 1000, y: 450, scale: 0.3 },
        ];

        decorations.forEach((dec, index) => {
            const decoration = this.add.image(dec.x, dec.y, dec.sprite);
            decoration.setScale(dec.scale);
            decoration.setAlpha(0.4);

            // Different floating patterns for each decoration
            this.tweens.add({
                targets: decoration,
                y: decoration.y + (15 + index * 5),
                duration: 2000 + index * 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });

            // Slow rotation
            this.tweens.add({
                targets: decoration,
                rotation: Math.PI * 2,
                duration: 8000 + index * 1000,
                repeat: -1,
                ease: 'Linear',
            });
        });
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
