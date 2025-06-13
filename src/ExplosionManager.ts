export class ExplosionManager {
    private scene: Phaser.Scene;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    // Static method for loading assets
    static preload(scene: Phaser.Scene): void {
        // Load explosion sprite
        scene.load.image('explosion_sprite', 'assets/explosion.png');
        
        // Create a simple but colorful explosion particle texture
        const graphics = scene.add.graphics();
        
        // Create a bright orange-red circle
        graphics.fillStyle(0xff4400, 1.0); // Bright orange-red
        graphics.fillCircle(8, 8, 6);
        
        // Add a brighter center
        graphics.fillStyle(0xffaa00, 1.0); // Bright yellow-orange
        graphics.fillCircle(8, 8, 3);
        
        // Generate texture from graphics
        graphics.generateTexture('explosion_particle', 16, 16);
        graphics.destroy();
    }

    create(): void {
        // Create particle emitter using single texture
        this.particles = this.scene.add.particles(0, 0, 'explosion_particle', {
            // Position will be set when explosion is triggered
            x: 0,
            y: 0,
            
            // Particle behavior - make more visible
            speed: { min: 80, max: 200 },
            scale: { start: 1.2, end: 0.1 },
            alpha: { start: 1, end: 0 },
            lifespan: 500, // Longer lifespan
            
            // Visual effects - add some color variation with tint
            tint: [0xff3300, 0xff6600, 0xff9900, 0xffcc00],
            blendMode: 'ADD',
            
            // Emission settings
            quantity: 12, // More particles
            frequency: -1, // Explode mode (emit all at once)
            
            // Spread pattern
            angle: { min: 0, max: 360 },
            
            // Physics
            gravityY: 0,
            bounce: 0,
            
            // Add some rotation for more dynamic effect
            rotate: { min: 0, max: 360 },
            
            // Don't emit automatically
            emitting: false,
        });
    }

    // Create explosion sprite animation
    private createExplosionSprite(x: number, y: number, scale: number = 1): void {
        // Create explosion sprite
        const explosionSprite = this.scene.add.image(x, y, 'explosion_sprite');
        explosionSprite.setOrigin(0.5, 0.5);
        explosionSprite.setScale(0.1 * scale); // Start small
        explosionSprite.setAlpha(0.9);
        explosionSprite.setBlendMode('ADD'); // Additive blending for glow effect

        // Create scale and fade animation
        this.scene.tweens.add({
            targets: explosionSprite,
            scaleX: 1.5 * scale, // Scale up to 1.5x the target size
            scaleY: 1.5 * scale,
            alpha: 0, // Fade out
            duration: 400, // Animation duration
            ease: 'Power2',
            onComplete: () => {
                explosionSprite.destroy(); // Clean up sprite
            }
        });
    }

    // Create explosion at specific position
    explode(x: number, y: number, intensity: number = 1): void {
        if (!this.particles) {
            return;
        }

        // Create explosion sprite
        this.createExplosionSprite(x, y, intensity);

        // Set explosion position for particles
        this.particles.setPosition(x, y);
        
        // Adjust intensity using modern API
        const baseQuantity = 12;
        const baseSpeed = { min: 80, max: 200 };
        
        // Update emitter configuration
        this.particles.setConfig({
            quantity: Math.floor(baseQuantity * intensity),
            speed: {
                min: baseSpeed.min * intensity,
                max: baseSpeed.max * intensity,
            },
        });
        
        // Trigger explosion particles
        this.particles.explode();
    }

    // Create different types of explosions with appropriate sizes
    explodeSmall(x: number, y: number): void {
        this.explode(x, y, 0.6); // Smaller explosion for asteroids
    }

    explodeMedium(x: number, y: number): void {
        this.explode(x, y, 0.8); // Medium explosion for kamikazes and gunners
    }

    explodeLarge(x: number, y: number): void {
        this.explode(x, y, 1.2); // Large explosion for leapers and player
    }

    destroy(): void {
        if (this.particles) {
            this.particles.destroy();
        }
    }
}
