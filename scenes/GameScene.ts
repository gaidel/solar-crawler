export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private asteroids!: Phaser.Physics.Arcade.Group;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private lastFired = 0;
    private bullets!: Phaser.Physics.Arcade.Group;
    private playerDebug!: Phaser.GameObjects.Graphics;

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
        const bg = this.add.tileSprite(640, 360, 1280, 720, 'background')!;
        bg.setScrollFactor(0);

        // Create player
        this.player = this.physics.add.sprite(200, 360, 'player')!;
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.5);
        this.player.setOrigin(0.5, 0.5); // Set anchor to center
        // Set circular collision body for player
        // Original size is 64x64, scaled to 0.5, so we use 32px radius (half of scaled width)
        this.player.setCircle(32, 48, 32); // Increased x offset to move collision circle right
        // Debug visualization
        this.playerDebug = this.add.graphics();
        this.playerDebug.lineStyle(2, 0xff0000);

        // Create bullets group with larger pool
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 20,
            runChildUpdate: true
        });

        // Create asteroids group
        this.asteroids = this.physics.add.group({
            defaultKey: 'asteroid',
            maxSize: 10
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
            delay: 2000,
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
            this.player.setVelocityY(-300);
        } else if (this.cursors.down?.isDown) {
            this.player.setVelocityY(300);
        } else {
            this.player.setVelocityY(0);
        }

        // Auto-fire bullets
        if (this.time.now > this.lastFired) {
            this.fireBullet();
            this.lastFired = this.time.now + 200;
        }

        // Update debug visualization
        this.playerDebug.clear();
        this.playerDebug.lineStyle(2, 0xff0000);
        this.playerDebug.strokeCircle(this.player.x, this.player.y, 32);

        // Clean up bullets
        this.bullets.getChildren().forEach((bullet) => {
            if (
                bullet instanceof Phaser.Physics.Arcade.Sprite &&
                bullet.active &&
                bullet.x > 1280
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
        const y = Phaser.Math.Between(100, 620);
        const asteroid = this.asteroids.get(1380, y, 'asteroid') as Phaser.Physics.Arcade.Sprite;
        
        if (asteroid) {
            console.log('Spawning asteroid:', asteroid);
            console.log('Asteroid origin:', asteroid.originX, asteroid.originY);
            asteroid.setActive(true);
            asteroid.setVisible(true);
            asteroid.setOrigin(0.5, 0.5); // Set anchor to center
            asteroid.setScale(0.5);
            asteroid.setVelocityX(-300);
            
            // Set circular collision body for asteroid
            // Original size is 207x201, scaled to 0.5, so we use ~50px radius
            // Offset by half the scaled width/height
            asteroid.setCircle(50, 50, 50);
            
            // Debug visualization
            const asteroidDebug = this.add.graphics();
            asteroidDebug.lineStyle(2, 0x00ff00);
            asteroidDebug.strokeCircle(asteroid.x, asteroid.y, 50);
        }
    }

    private hitAsteroid(bullet: Phaser.Physics.Arcade.Sprite, asteroid: Phaser.Physics.Arcade.Sprite) {
        // Deactivate both bullet and asteroid
        bullet.setActive(false);
        bullet.setVisible(false);
        asteroid.setActive(false);
        asteroid.setVisible(false);
        // Disable the asteroid's physics body
        if (asteroid.body) {
            asteroid.body.enable = false;
        }
    }

    private gameOver() {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
    }

    private fireBullet() {
        const bullet = this.bullets.get(this.player.x + 50, this.player.y, 'bullet');
        if (bullet) {
            console.log('Creating bullet at:', this.player.x + 50, this.player.y);
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setScale(0.1); // Scale down the bullet
            bullet.setVelocityX(400);
            console.log('Bullet created, active:', bullet.active, 'visible:', bullet.visible);
        } else {
            console.log('Failed to create bullet - no available bullets in pool');
        }
    }
}
