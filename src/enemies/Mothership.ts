import { BaseEnemy } from './Enemy';
import { GAME_CONFIG, DEPTH_CONFIG } from '../config/constants';

export class Mothership extends BaseEnemy {
    public scoreValue: number = 5000; // High score for boss
    public maxHP: number = 5000; // Very high HP for epic boss battle (~80 seconds with max DPS)
    private dissolveTimer?: Phaser.Time.TimerEvent;
    private isDissolving: boolean = true;
    private targetX: number = GAME_CONFIG.WIDTH + 50; // Final position (center slightly off-screen right, more left part visible)
    
    // Firing system
    private lastFireTime: number = 0;
    private fireRate: number = 1500; // Fire every 1.5 seconds (faster than gunners)
    private bulletSpeed: number = 400; // Same as large gunner (but positive for targeting)
    private bullets: Phaser.Physics.Arcade.Group;

    static preload(scene: Phaser.Scene): void {
        scene.load.image('mothership', 'assets/mothership.png');
    }

    constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, bullets: Phaser.Physics.Arcade.Group) {
        super(scene, group);
        this.bullets = bullets;
    }

    spawn(x: number, y: number): void {
        if (this.isActive) {
            return; // Boss already active
        }

        this.isActive = true;
        this.currentHP = this.maxHP;

        // Create or reuse sprite
        if (!this.sprite) {
            this.sprite = this.scene.physics.add.sprite(x, y, 'mothership');
            this.group.add(this.sprite);
        } else {
            this.sprite.setPosition(x, y);
            this.sprite.setActive(true);
            this.sprite.setVisible(true);
            
            // Re-enable physics body when reusing sprite
            if (this.sprite.body) {
                this.sprite.body.enable = true;
            }
        }

        // Set large scale for boss (original is 669x471, scale to fit most of screen height)
        const scaleY = (GAME_CONFIG.HEIGHT * 0.8) / 471; // 80% of screen height
        const scaleX = scaleY; // Keep aspect ratio
        this.sprite.setScale(scaleX, scaleY);

        // Set circular collision body using proper centering approach like other enemies
        const paddingFactor = 0.7; // Collision for boss (70% of sprite size - nearly ideal)
        const radius = (Math.min(669, 471) / 2) * paddingFactor; // Use original sprite dimensions
        
        // Calculate proper offset to center the collision circle, but shift left
        const offsetX = (669 - radius * 2) / 2 - 40; // Shifted 40px to the left
        const offsetY = (471 - radius * 2) / 2 + 30; // Slightly lower (30px down from center)
        
        this.sprite.body!.setCircle(radius, offsetX, offsetY);

        // Set boss depth to render above regular enemies but below player
        this.sprite.setDepth(DEPTH_CONFIG.MOTHERSHIP);

        // Start dissolve effect
        this.startDissolveEffect();

        console.log(`[MOTHERSHIP] Boss spawned at (${x}, ${y}) with ${this.maxHP} HP`);
    }

    private startDissolveEffect(): void {
        this.isDissolving = true;
        
        // Start invisible
        this.sprite.setAlpha(0);
        
        // Dissolve in over 2 seconds
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 1,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.isDissolving = false;
                this.startMovementToPosition();
            }
        });
    }

    private startMovementToPosition(): void {
        // Move slowly to final position (mostly off-screen on the right)
        this.scene.tweens.add({
            targets: this.sprite,
            x: this.targetX,
            duration: 3000, // 3 seconds to reach position
            ease: 'Power2'
        });
    }

    update(playerX: number, playerY: number): void {
        if (!this.isActive || !this.sprite.active) {
            return;
        }

        // Update health bar position if it exists
        this.updateHealthBarPosition();

        // Boss doesn't move much after reaching position, just slight hovering
        if (!this.isDissolving && Math.abs(this.sprite.x - this.targetX) < 10) {
            // Slight vertical hovering motion
            const hoverOffset = Math.sin(this.scene.time.now * 0.001) * 10;
            this.sprite.y = GAME_CONFIG.HEIGHT / 2 + hoverOffset;
            
            // Fire bullets periodically when in position
            const currentTime = this.scene.time.now;
            if (currentTime - this.lastFireTime > this.fireRate) {
                this.fireBullet(playerX, playerY);
                this.lastFireTime = currentTime;
            }
        }
    }

    takeDamage(damage: number): boolean {
        console.log(`[MOTHERSHIP] Boss takes ${damage} damage! HP: ${this.currentHP - damage}/${this.maxHP}`);
        const destroyed = super.takeDamage(damage);
        
        if (destroyed) {
            console.log('[MOTHERSHIP] Boss destroyed! Victory!');
            // Death explosion is now handled by EnemyManager for consistency
        }
        
        return destroyed;
    }

    private fireBullet(playerX: number, playerY: number): void {
        // Calculate random spawn point inside the boss collision circle
        const paddingFactor = 0.7; // Same as collision setup
        const radius = (Math.min(669, 471) / 2) * paddingFactor; // Same radius as collision
        const offsetX = (669 - radius * 2) / 2 - 40; // Same offset as collision (shifted left)
        const offsetY = (471 - radius * 2) / 2 + 30; // Same offset as collision (shifted down)
        
        // Calculate collision circle center in world coordinates
        const collisionCenterX = this.sprite.x - 669/2 + offsetX + radius;
        const collisionCenterY = this.sprite.y - 471/2 + offsetY + radius;
        
        // Generate random point inside the collision circle
        const angle = Math.random() * Math.PI * 2; // Random angle
        const distance = Math.random() * radius * 0.8; // Random distance (80% of radius for safety)
        const randomX = collisionCenterX + Math.cos(angle) * distance;
        const randomY = collisionCenterY + Math.sin(angle) * distance;
        
        // Find or create bullet
        let bullet: Phaser.Physics.Arcade.Sprite | null = null;

        this.bullets.getChildren().forEach((child) => {
            if (!bullet && child instanceof Phaser.Physics.Arcade.Sprite && !child.active) {
                bullet = child;
            }
        });

        if (!bullet) {
            bullet = this.bullets.get(randomX, randomY, 'enemy_bullet') as Phaser.Physics.Arcade.Sprite;
        }

        if (bullet) {
            // Reset bullet position and properties
            bullet.setPosition(randomX, randomY);
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setScale(0.3); // Same as large gunner
            bullet.setOrigin(0.5, 0.5);

            // Enable physics body
            if (bullet.body) {
                bullet.body.enable = true;
            }

            // Set proper depth for enemy bullets
            bullet.setDepth(DEPTH_CONFIG.ENEMY_BULLETS);

            // Set up collision
            const radius = Math.min(bullet.width, bullet.height) / 2 * 0.9;
            const offsetX = (bullet.width - radius * 2) / 2;
            const offsetY = (bullet.height - radius * 2) / 2;
            bullet.setCircle(radius, offsetX, offsetY);

            // Calculate direction to player
            const deltaX = playerX - randomX;
            const deltaY = playerY - randomY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Normalize direction and apply speed
            if (distance > 0) {
                const velocityX = (deltaX / distance) * this.bulletSpeed;
                const velocityY = (deltaY / distance) * this.bulletSpeed;
                bullet.setVelocity(velocityX, velocityY);
            }

            console.log(`[MOTHERSHIP] Fired bullet from (${Math.round(randomX)}, ${Math.round(randomY)}) toward player at (${Math.round(playerX)}, ${Math.round(playerY)})`);
        }
    }

    onHit(): void {
        // Boss death - fade out dramatically
        if (this.sprite) {
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    super.onHit();
                }
            });
        } else {
            super.onHit();
        }
    }

    // Override reset to handle boss-specific cleanup
    reset(): void {
        this.isDissolving = false;
        if (this.dissolveTimer) {
            this.dissolveTimer.remove();
            this.dissolveTimer = undefined;
        }
        super.reset();
    }

    // Override destroy to handle boss-specific cleanup
    destroy(): void {
        if (this.dissolveTimer) {
            this.dissolveTimer.remove();
            this.dissolveTimer = undefined;
        }
        super.destroy();
    }
} 