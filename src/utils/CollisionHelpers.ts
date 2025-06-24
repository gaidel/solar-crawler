// Collision utility functions for game entities

/**
 * Calculate collision circle radius based on sprite dimensions
 * @param sprite - The sprite to calculate radius for
 * @param paddingFactor - Factor to make collision more forgiving (0.8 = 80% of sprite size)
 * @returns Effective collision radius
 */
export function getCollisionRadius(
    sprite: Phaser.Physics.Arcade.Sprite,
    paddingFactor: number = 0.8
): number {
    // Use original sprite dimensions since setCircle works with pre-scaled sizes
    // Phaser will scale the collision body along with the sprite
    const effectiveRadius = (Math.min(sprite.width, sprite.height) / 2) * paddingFactor;
    return effectiveRadius;
}

/**
 * Set up circular collision body properly centered on sprite
 * @param sprite - The sprite to set collision for
 * @param paddingFactor - Factor to make collision more forgiving (0.8 = 80% of sprite size)
 */
export function setupCircularCollision(
    sprite: Phaser.Physics.Arcade.Sprite,
    paddingFactor: number = 0.8
): void {
    const radius = getCollisionRadius(sprite, paddingFactor);

    // Calculate offset to center the collision circle
    // Phaser's setCircle expects offset from top-left corner of the original sprite
    const offsetX = (sprite.width - radius * 2) / 2;
    const offsetY = (sprite.height - radius * 2) / 2;

    sprite.setCircle(radius, offsetX, offsetY);
}

/**
 * Set up optimized rectangular collision for player ship
 * Creates a narrower rectangle that better fits elongated ship sprites
 * @param sprite - The player sprite to set collision for
 * @param widthFactor - Width as percentage of sprite width (0.6 = 60%)
 * @param heightFactor - Height as percentage of sprite height (0.8 = 80%)
 * @param offsetY - Additional Y offset from center in pixels (positive = down)
 */
export function setupPlayerCollision(
    sprite: Phaser.Physics.Arcade.Sprite,
    widthFactor: number = 0.6,
    heightFactor: number = 0.8,
    offsetY: number = 0
): void {
    // Calculate collision box dimensions
    const collisionWidth = sprite.width * widthFactor;
    const collisionHeight = sprite.height * heightFactor;

    // Calculate offset to center the collision box with optional Y adjustment
    // Example: sprite 100px, collision 60px → offset 20px + additional Y offset
    const offsetX = (sprite.width - collisionWidth) / 2;
    const calculatedOffsetY = (sprite.height - collisionHeight) / 2 + offsetY;

    // Set rectangular collision body
    sprite.body!.setSize(collisionWidth, collisionHeight, false);
    sprite.body!.setOffset(offsetX, calculatedOffsetY);
}

/**
 * Set up optimized collision for very elongated sprites (like bullets)
 * Creates a narrower collision area that matches the sprite's actual shape better
 * @param sprite - The sprite to set collision for
 * @param widthFactor - Width as percentage of sprite width (0.3 = 30% for thin bullets)
 * @param heightFactor - Height as percentage of sprite height (0.9 = 90% for full length)
 */
export function setupElongatedCollision(
    sprite: Phaser.Physics.Arcade.Sprite,
    widthFactor: number = 0.3,
    heightFactor: number = 0.9
): void {
    // Calculate collision box dimensions
    const collisionWidth = sprite.width * widthFactor;
    const collisionHeight = sprite.height * heightFactor;

    // Calculate offset to center the collision box
    const offsetX = (sprite.width - collisionWidth) / 2;
    const offsetY = (sprite.height - collisionHeight) / 2;

    // Set rectangular collision body
    sprite.body!.setSize(collisionWidth, collisionHeight, false);
    sprite.body!.setOffset(offsetX, offsetY);
}

/**
 * Set up optimized rectangular collision for enemy gunner ships
 * Creates a narrower rectangle that better fits elongated enemy ship sprites
 * @param sprite - The gunner sprite to set collision for
 * @param widthFactor - Width as percentage of sprite width (0.6 = 60%)
 * @param heightFactor - Height as percentage of sprite height (0.5 = 50%)
 * @param offsetX - Additional X offset from center in pixels (positive = right)
 * @param offsetY - Additional Y offset from center in pixels (positive = down)
 */
export function setupGunnerCollision(
    sprite: Phaser.Physics.Arcade.Sprite,
    widthFactor: number = 0.6,
    heightFactor: number = 0.5,
    offsetX: number = 0,
    offsetY: number = 0
): void {
    // Calculate collision box dimensions
    const collisionWidth = sprite.width * widthFactor;
    const collisionHeight = sprite.height * heightFactor;

    // Calculate offset to center the collision box with optional X/Y adjustments
    const calculatedOffsetX = (sprite.width - collisionWidth) / 2 + offsetX;
    const calculatedOffsetY = (sprite.height - collisionHeight) / 2 + offsetY;

    // Set rectangular collision body
    sprite.body!.setSize(collisionWidth, collisionHeight, false);
    sprite.body!.setOffset(calculatedOffsetX, calculatedOffsetY);
}
