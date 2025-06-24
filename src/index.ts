import 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { AboutScene } from './scenes/AboutScene';
import { ControlsScene } from './scenes/ControlsScene';
import { CreditsScene } from './scenes/CreditsScene';
import { GameScene } from './scenes/GameScene';

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
