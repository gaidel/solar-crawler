// Game constants and sprite configurations
export const GAME_CONFIG = {
    WIDTH: 1280,
    HEIGHT: 720,
    WIN_TIME: 60000, // Victory time in milliseconds (1 minute)
    BACKGROUND_SCROLL_SPEED: 2,
};

export const UI_CONFIG = {
    FONT_SIZE_LARGE: '48px',
    FONT_SIZE_MEDIUM: '32px',
    FONT_SIZE_SMALL: '24px',
    BUTTON_PADDING: 20,
    OVERLAY_ALPHA: 0.7,
    HUD_HEIGHT: 40, // Reserved space at top for HUD
};

export const PLAYER_CONFIG = {
    START_X: 100,
    START_Y: 400, // Moved down to avoid HUD area
    SCALE: 0.8,
    SPEED: 300,
    FIRE_RATE: 300, // ms between shots
    MOVEMENT_Y_MIN: 60, // Can't move above HUD area
    MOVEMENT_Y_MAX: 680, // Can't move below screen
};

export const ASTEROID_CONFIG = {
    SCALE: 0.5,
    SPEED: -300,
    SPAWN_INTERVAL: 2000, // ms
    SPAWN_Y_MIN: 60, // Below HUD area
    SPAWN_Y_MAX: 620,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 15, // Enlarged pool to handle simultaneous destructions
    MAX_HP: 40, // Takes 4 hits to destroy
};

export const KAMIKAZE_CONFIG = {
    SCALE: 0.5, // Scale for new sprite 170x120 -> 85x60
    SPEED: -200, // No longer used, kept for compatibility
    HOMING_SPEED: 180, // Total movement speed towards player
    SPAWN_INTERVAL: 4000, // Less frequent than asteroids
    SPAWN_Y_MIN: 60, // Below HUD area
    SPAWN_Y_MAX: 620,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 8,
    MAX_HP: 20, // Takes 2 hits to destroy
};

export const BULLET_CONFIG = {
    SCALE: 0.1,
    SPEED: 400,
    MAX_POOL_SIZE: 20,
    OFFSET_X: 50, // Distance from player center
    DAMAGE: 10, // Player bullet damage
};

export const GUNNER_CONFIG = {
    SCALE: 0.6,
    SPEED: -180, // Slower movement - more time to shoot
    SPAWN_INTERVAL: 5000, // Less frequent than asteroids
    SPAWN_Y_MIN: 60, // Below HUD area
    SPAWN_Y_MAX: 620,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 6,
    FIRE_RATE: 2000, // Fires every 2 seconds
    BULLET_SPEED: -400, // Faster bullets
    BULLET_SCALE: 0.15,
    MAX_HP: 20, // Takes 2 hits to destroy
};

export const LEAPER_CONFIG = {
    SCALE: 0.55,
    SPEED: -280,
    SPAWN_INTERVAL: 3500, // Moderate frequency
    SPAWN_Y_MIN: 110, // Below HUD area with extra space for zigzag
    SPAWN_Y_MAX: 570,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 8,
    ZIGZAG_AMPLITUDE: 150, // Height of zigzag
    ZIGZAG_FREQUENCY: 0.002, // Speed of zigzag pattern (slower = longer waves)
    MAX_HP: 40, // Takes 4 hits to destroy
};

export const SCORE_CONFIG = {
    ASTEROID: 10,
    KAMIKAZE: 20,
    GUNNER: 15,
    LEAPER: 25,
};

export const DAMAGE_CONFIG = {
    // Damage dealt TO player
    ENEMY_BULLET: 30,
    KAMIKAZE_COLLISION: 50,
    GUNNER_COLLISION: 50,
    LEAPER_COLLISION: 80,
    ASTEROID_COLLISION: 100, // Instant kill
};
