import { PLAYER_CONFIG, ASTEROID_CONFIG, BULLET_CONFIG, GAME_CONFIG } from '../config/constants';
import { setupCircularCollision } from '../utils/CollisionHelpers';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private asteroids!: Phaser.Physics.Arcade.Group;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private lastFired = 0;
    private bullets!: Phaser.Physics.Arcade.Group;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load assets
        this.load.image('player', 'assets/player.png');
        this.load.image('asteroid', 'assets/asteroid.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('background', 'assets/background.png');
    }

    create() {
        // Add background
        const bg = this.add.tileSprite(GAME_CONFIG.WIDTH/2, GAME_CONFIG.HEIGHT/2, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT, 'background')!;
        bg.setScrollFactor(0);

        // Create player
        this.player = this.physics.add.sprite(PLAYER_CONFIG.START_X, PLAYER_CONFIG.START_Y, 'player')!;
        this.player.setCollideWorldBounds(true);
        this.player.setScale(PLAYER_CONFIG.SCALE);
        this.player.setOrigin(0.5, 0.5);
        
        // Set up player collision using dynamic calculation
        setupCircularCollision(this.player, 0.9); // Чуть меньше для более щадящего геймплея

        // Create bullets group
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: BULLET_CONFIG.MAX_POOL_SIZE,
            runChildUpdate: true
        });

        // Create asteroids group
        this.asteroids = this.physics.add.group({
            defaultKey: 'asteroid',
            maxSize: ASTEROID_CONFIG.MAX_POOL_SIZE
        });

        // Set up keyboard input
        this.cursors = this.input!.keyboard!.createCursorKeys()!;

        // Set up collisions
        this.physics.add.collider(
            this.bullets,
            this.asteroids,
            (bullet, asteroid) => this.hitAsteroid(bullet as Phaser.Physics.Arcade.Sprite, asteroid as Phaser.Physics.Arcade.Sprite),
            undefined,
            this
        );
        this.physics.add.collider(this.player, this.asteroids, this.gameOver, undefined, this);

        // Start spawning asteroids
        this.time.addEvent({
            delay: ASTEROID_CONFIG.SPAWN_INTERVAL,
            callback: this.spawnAsteroid,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        // Update background
        const bg = this.children.list[0] as Phaser.GameObjects.TileSprite;
        bg.tilePositionX += 2;

        // Handle player movement
        if (this.cursors.up?.isDown) {
            this.player.setVelocityY(-PLAYER_CONFIG.SPEED);
        } else if (this.cursors.down?.isDown) {
            this.player.setVelocityY(PLAYER_CONFIG.SPEED);
        } else {
            this.player.setVelocityY(0);
        }

        // Auto-fire bullets
        if (this.time.now > this.lastFired) {
            this.fireBullet();
            this.lastFired = this.time.now + PLAYER_CONFIG.FIRE_RATE;
        }

        // Clean up bullets
        this.bullets.getChildren().forEach((bullet) => {
            if (
                bullet instanceof Phaser.Physics.Arcade.Sprite &&
                bullet.active &&
                bullet.x > GAME_CONFIG.WIDTH
            ) {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });

        // Clean up asteroids
        this.asteroids.getChildren().forEach((asteroid) => {
            if (
                asteroid instanceof Phaser.Physics.Arcade.Sprite &&
                asteroid.active &&
                asteroid.x < -100
            ) {
                asteroid.setActive(false);
                asteroid.setVisible(false);
            }
        });
    }

    private spawnAsteroid() {
        const y = Phaser.Math.Between(ASTEROID_CONFIG.SPAWN_Y_MIN, ASTEROID_CONFIG.SPAWN_Y_MAX);
        const asteroid = this.asteroids.get(ASTEROID_CONFIG.SPAWN_X, y, 'asteroid') as Phaser.Physics.Arcade.Sprite;
        
        if (asteroid) {
            console.log('Spawning asteroid at:', ASTEROID_CONFIG.SPAWN_X, y);
            asteroid.setActive(true);
            asteroid.setVisible(true);
            asteroid.setOrigin(0.5, 0.5);
            asteroid.setScale(ASTEROID_CONFIG.SCALE);
            asteroid.setVelocityX(ASTEROID_CONFIG.SPEED);
            
            // Set up collision using dynamic calculation
            setupCircularCollision(asteroid, 0.9); // Чуть меньше для более щадящего геймплея
            
            console.log('Asteroid size:', asteroid.displayWidth, 'x', asteroid.displayHeight);
        }
    }

    private hitAsteroid(bullet: Phaser.Physics.Arcade.Sprite, asteroid: Phaser.Physics.Arcade.Sprite) {
        // Deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);
        
        // Move asteroid off-screen and deactivate it for reuse
        asteroid.x = -200; // Перемещаем за левый край экрана
        asteroid.setVelocityX(0); // Останавливаем движение
        asteroid.setActive(false);
        asteroid.setVisible(false);
        
        // Re-enable physics body for future reuse
        if (asteroid.body) {
            asteroid.body.enable = true;
        }
        
        console.log('Asteroid destroyed, moved off-screen for reuse');
    }

    private gameOver() {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
    }

    private fireBullet() {
        const bullet = this.bullets.get(this.player.x + BULLET_CONFIG.OFFSET_X, this.player.y, 'bullet');
        if (bullet) {
            console.log('Creating bullet at:', this.player.x + BULLET_CONFIG.OFFSET_X, this.player.y);
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setScale(BULLET_CONFIG.SCALE);
            bullet.setVelocityX(BULLET_CONFIG.SPEED);
            console.log('Bullet created, active:', bullet.active, 'visible:', bullet.visible);
        } else {
            console.log('Failed to create bullet - no available bullets in pool');
        }
    }
}
