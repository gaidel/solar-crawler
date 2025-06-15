export interface Enemy {
    // Core enemy properties
    sprite: Phaser.Physics.Arcade.Sprite;
    isActive: boolean;
    scoreValue: number;
    currentHP: number;
    maxHP: number;

    // Lifecycle methods
    spawn(x: number, y: number): void;
    update(playerX: number, playerY: number): void;
    destroy(): void;

    // State methods
    takeDamage(damage: number): boolean; // Returns true if enemy is destroyed
    onHit(): void;
    reset(): void;
}

export abstract class BaseEnemy implements Enemy {
    public sprite!: Phaser.Physics.Arcade.Sprite;
    public isActive: boolean = false;
    public abstract scoreValue: number;
    public currentHP: number = 0;
    public abstract maxHP: number;

    protected scene: Phaser.Scene;
    protected group: Phaser.Physics.Arcade.Group;
    private damageFlashTimer: Phaser.Time.TimerEvent | null = null;
    protected healthBar: Phaser.GameObjects.Graphics | null = null;

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

    private createHealthBar(): void {
        if (this.healthBar) {
            this.healthBar.destroy();
        }

        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }

    private updateHealthBar(): void {
        if (!this.healthBar || !this.sprite) {
            return;
        }

        const barWidth = 40;
        const barHeight = 4;
        const barX = this.sprite.x - barWidth / 2;
        const barY = this.sprite.y + this.sprite.displayHeight / 2 + 5;

        // Clear previous drawing
        this.healthBar.clear();

        // Background (red - missing health)
        this.healthBar.fillStyle(0x330000, 0.7); // Dark red, semi-transparent
        this.healthBar.fillRect(barX, barY, barWidth, barHeight);

        // Foreground (green - current health)
        const healthPercentage = this.currentHP / this.maxHP;
        const healthWidth = barWidth * healthPercentage;
        
        // Color changes based on health percentage
        let healthColor = 0x00ff00; // Green
        if (healthPercentage < 0.3) {
            healthColor = 0xff0000; // Red
        } else if (healthPercentage < 0.6) {
            healthColor = 0xffaa00; // Orange
        }

        this.healthBar.fillStyle(healthColor, 0.8); // Semi-transparent
        this.healthBar.fillRect(barX, barY, healthWidth, barHeight);

        // Border
        this.healthBar.lineStyle(1, 0x000000, 0.5);
        this.healthBar.strokeRect(barX, barY, barWidth, barHeight);
    }

    private hideHealthBar(): void {
        if (this.healthBar) {
            this.healthBar.setVisible(false);
        }
    }

    private showHealthBar(): void {
        if (this.healthBar) {
            this.healthBar.setVisible(true);
        }
    }

    protected updateHealthBarPosition(): void {
        // Call this from enemy update methods to keep health bar positioned correctly
        if (this.healthBar && this.currentHP < this.maxHP) {
            this.updateHealthBar();
        }
    }

    takeDamage(damage: number): boolean {
        this.currentHP -= damage;

        // Create health bar if it doesn't exist (first damage)
        if (!this.healthBar) {
            this.createHealthBar();
        } else {
            // Update existing health bar
            this.updateHealthBar();
        }

        // Visual feedback for damage (bright yellow flash)
        this.sprite.setTint(0xffff00); // Bright yellow tint
        
        // Clear any existing damage flash timer to prevent conflicts
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
        }
        
        // Create new timer to restore original color (100ms for quick flash)
        this.damageFlashTimer = this.scene.time.delayedCall(100, () => {
            if (this.sprite && this.sprite.active) {
                this.sprite.clearTint();
            }
            this.damageFlashTimer = null;
        });

        if (this.currentHP <= 0) {
            this.onHit();
            return true; // Enemy destroyed
        }
        return false; // Enemy still alive
    }

    onHit(): void {
        // Clear damage flash timer and tint before destroying
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
            this.damageFlashTimer = null;
        }

        // Hide health bar
        if (this.healthBar) {
            this.healthBar.setVisible(false);
        }

        // Move off-screen and deactivate for reuse
        this.sprite.x = -200;
        this.sprite.setVelocityX(0);
        this.sprite.setVelocityY(0);
        this.sprite.clearTint(); // Clear any damage tint
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
        this.currentHP = 0; // Reset HP to 0 when inactive
        
        // Clear damage flash timer if it exists
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
            this.damageFlashTimer = null;
        }

        // Hide health bar
        if (this.healthBar) {
            this.healthBar.setVisible(false);
        }
        
        if (this.sprite) {
            this.sprite.setActive(false);
            this.sprite.setVisible(false);
            this.sprite.clearTint(); // Clear any damage tint
        }
    }

    destroy(): void {
        // Clear damage flash timer if it exists
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
            this.damageFlashTimer = null;
        }

        // Destroy health bar
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }
        
        if (this.sprite) {
            this.sprite.destroy();
        }
        this.isActive = false;
    }

    // Helper method to check if enemy should be cleaned up
    shouldCleanup(_gameWidth: number, _gameHeight: number): boolean {
        if (!this.isActive || !this.sprite.active) {
            return false;
        }

        // Default cleanup for enemies that move off-screen
        return this.sprite.x < -100;
    }
}
