import 'phaser';
import { MainMenuScene } from './src/scenes/MainMenuScene';
import { AboutScene } from './src/scenes/AboutScene';
import { ControlsScene } from './src/scenes/ControlsScene';
import { CreditsScene } from './src/scenes/CreditsScene';
import { GameScene } from './src/scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false, // Debug mode disabled for clean gameplay
        },
    },
    scene: [MainMenuScene, AboutScene, ControlsScene, CreditsScene, GameScene],
};

new Phaser.Game(config);
