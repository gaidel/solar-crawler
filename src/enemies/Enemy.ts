export interface Enemy {
    // Core enemy properties
    sprite: Phaser.Physics.Arcade.Sprite;
    isActive: boolean;
    scoreValue: number;

    // Lifecycle methods
    spawn(x: number, y: number): void;
    update(playerX: number, playerY: number): void;
    destroy(): void;

    // State methods
    onHit(): void;
    reset(): void;
}

export abstract class BaseEnemy implements Enemy {
    public sprite!: Phaser.Physics.Arcade.Sprite;
    public isActive: boolean = false;
    public abstract scoreValue: number;

    protected scene: Phaser.Scene;
    protected group: Phaser.Physics.Arcade.Group;

    // Static method for loading assets - to be implemented by subclasses
    static preload(scene: Phaser.Scene): void {
        // Base implementation does nothing - subclasses should override
    }

    constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
        this.scene = scene;
        this.group = group;
    }

    abstract spawn(x: number, y: number): void;
    abstract update(playerX: number, playerY: number): void;

    onHit(): void {
        // Move off-screen and deactivate for reuse
        this.sprite.x = -200;
        this.sprite.setVelocityX(0);
        this.sprite.setVelocityY(0);
        this.sprite.setActive(false);
        this.sprite.setVisible(false);

        // Re-enable physics body for future reuse
        if (this.sprite.body) {
            this.sprite.body.enable = true;
        }

        this.isActive = false;
    }

    reset(): void {
        this.isActive = false;
        if (this.sprite) {
            this.sprite.setActive(false);
            this.sprite.setVisible(false);
        }
    }

    destroy(): void {
        if (this.sprite) {
            this.sprite.destroy();
        }
        this.isActive = false;
    }

    // Helper method to check if enemy should be cleaned up
    shouldCleanup(gameWidth: number, gameHeight: number): boolean {
        if (!this.isActive || !this.sprite.active) {
            return false;
        }

        // Default cleanup for enemies that move off-screen
        return this.sprite.x < -100;
    }
}
