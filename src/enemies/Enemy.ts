import { UPGRADE_CONFIG } from '../config/constants';

// Interface for acid damage over time effect
export interface AcidEffect {
    damage: number;
    timer: Phaser.Time.TimerEvent;
}

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

    // Acid effect methods
    applyAcidEffect(damage: number, onEnemyDestroyed?: (enemy: Enemy, explosionX: number, explosionY: number) => void): void;
    hasAcidEffects(): boolean;
    pauseAcidEffects(): void;
    resumeAcidEffects(): void;
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
    
    // Acid effects system
    private acidEffects: AcidEffect[] = [];
    private baseColor: number = 0xffffff; // Store original color for acid tinting

    // Static method for loading assets - to be implemented by subclasses
    static preload(_scene: Phaser.Scene): void {
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
                // Restore appropriate color (base or acid tint)
                this.updateTintColor();
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

        // Clear all acid effects
        this.clearAcidEffects();

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

        // Clear all acid effects
        this.clearAcidEffects();

        // Hide health bar
        if (this.healthBar) {
            this.healthBar.setVisible(false);
        }

        if (this.sprite) {
            this.sprite.setActive(false);
            this.sprite.setVisible(false);
            this.sprite.clearTint(); // Clear any damage tint

            // Disable physics body to prevent collisions with invisible enemies
            if (this.sprite.body) {
                this.sprite.body.enable = false;
            }
        }
    }

    destroy(): void {
        // Clear damage flash timer if it exists
        if (this.damageFlashTimer) {
            this.damageFlashTimer.remove();
            this.damageFlashTimer = null;
        }

        // Clear all acid effects
        this.clearAcidEffects();

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

    // Acid effects system methods
    applyAcidEffect(damage: number, onEnemyDestroyed?: (enemy: Enemy, explosionX: number, explosionY: number) => void): void {
        // Create acid timer that applies damage after delay
        const acidTimer = this.scene.time.delayedCall(UPGRADE_CONFIG.ACID_DURATION, () => {
            // Apply acid damage if enemy is still alive and active
            if (this.isActive && this.sprite.active && this.currentHP > 0) {
                // Save position BEFORE calling takeDamage (which may move the enemy)
                const explosionX = this.sprite.x;
                const explosionY = this.sprite.y;
                
                const destroyed = this.takeDamage(damage);
                
                // If enemy was destroyed by acid damage, call the callback with saved position
                if (destroyed && onEnemyDestroyed) {
                    onEnemyDestroyed(this, explosionX, explosionY);
                }
            }
            
            // Remove this effect from the array
            this.acidEffects = this.acidEffects.filter(effect => effect.timer !== acidTimer);
            
            // Update tint based on remaining acid effects
            this.updateTintColor();
        });

        // Add the effect to our tracking array
        const acidEffect: AcidEffect = {
            damage: damage,
            timer: acidTimer
        };
        this.acidEffects.push(acidEffect);

        // Update visual tint to show acid effect
        this.updateTintColor();
    }

    hasAcidEffects(): boolean {
        return this.acidEffects.length > 0;
    }

    private updateTintColor(): void {
        if (!this.sprite || !this.sprite.active) {
            return;
        }

        if (this.hasAcidEffects()) {
            this.sprite.setTint(UPGRADE_CONFIG.ACID_TINT_COLOR);
        } else {
            this.sprite.setTint(this.baseColor);
        }
    }

    private clearAcidEffects(): void {
        // Clear all acid effect timers
        this.acidEffects.forEach(effect => {
            if (effect.timer) {
                effect.timer.remove();
            }
        });
        this.acidEffects = [];
        this.updateTintColor();
    }

    pauseAcidEffects(): void {
        // Pause all active acid effect timers
        this.acidEffects.forEach(effect => {
            if (effect.timer && !effect.timer.hasDispatched) {
                effect.timer.paused = true;
            }
        });
    }

    resumeAcidEffects(): void {
        // Resume all paused acid effect timers
        this.acidEffects.forEach(effect => {
            if (effect.timer && !effect.timer.hasDispatched) {
                effect.timer.paused = false;
            }
        });
    }
}
