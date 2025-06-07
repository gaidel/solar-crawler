// Collision utility functions for game entities

/**
 * Calculate collision circle radius based on sprite dimensions
 * @param sprite - The sprite to calculate radius for
 * @param paddingFactor - Factor to make collision more forgiving (0.8 = 80% of sprite size)
 * @returns Effective collision radius
 */
export function getCollisionRadius(sprite: Phaser.Physics.Arcade.Sprite, paddingFactor: number = 0.8): number {
    // Use original sprite dimensions since setCircle works with pre-scaled sizes
    // Phaser will scale the collision body along with the sprite
    const effectiveRadius = Math.min(sprite.width, sprite.height) / 2 * paddingFactor;
    return effectiveRadius;
}

/**
 * Set up circular collision body properly centered on sprite
 * @param sprite - The sprite to set collision for
 * @param paddingFactor - Factor to make collision more forgiving (0.8 = 80% of sprite size)
 */
export function setupCircularCollision(sprite: Phaser.Physics.Arcade.Sprite, paddingFactor: number = 0.8): void {
    const radius = getCollisionRadius(sprite, paddingFactor);
    
    // Debug information
    console.log('Setting up collision for sprite:');
    console.log('  - Original size:', sprite.width, 'x', sprite.height);
    console.log('  - Display size:', sprite.displayWidth, 'x', sprite.displayHeight);
    console.log('  - Scale:', sprite.scaleX, 'x', sprite.scaleY);
    console.log('  - Padding factor:', paddingFactor);
    console.log('  - Calculated radius (for original):', radius);
    console.log('  - Effective radius (after scale):', radius * sprite.scaleX);
    
    // Calculate offset to center the collision circle
    // Phaser's setCircle expects offset from top-left corner of the original sprite
    const offsetX = (sprite.width - radius * 2) / 2;
    const offsetY = (sprite.height - radius * 2) / 2;
    
    console.log('  - Offset:', offsetX, 'x', offsetY);
    
    sprite.setCircle(radius, offsetX, offsetY);
} 