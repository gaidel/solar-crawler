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
};

export const PLAYER_CONFIG = {
    START_X: 100,
    START_Y: 360,
    SCALE: 0.8,
    SPEED: 300,
    FIRE_RATE: 300, // ms between shots
};

export const ASTEROID_CONFIG = {
    SCALE: 0.5,
    SPEED: -300,
    SPAWN_INTERVAL: 2000, // ms
    SPAWN_Y_MIN: 100,
    SPAWN_Y_MAX: 620,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 15, // Enlarged pool to handle simultaneous destructions
};

export const KAMIKAZE_CONFIG = {
    SCALE: 0.5, // Scale for new sprite 170x120 -> 85x60
    SPEED: -200, // No longer used, kept for compatibility
    HOMING_SPEED: 180, // Total movement speed towards player
    SPAWN_INTERVAL: 4000, // Less frequent than asteroids
    SPAWN_Y_MIN: 100,
    SPAWN_Y_MAX: 620,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 8,
};

export const BULLET_CONFIG = {
    SCALE: 0.1,
    SPEED: 400,
    MAX_POOL_SIZE: 20,
    OFFSET_X: 50, // Distance from player center
};

export const GUNNER_CONFIG = {
    SCALE: 0.6,
    SPEED: -250,
    SPAWN_INTERVAL: 5000, // Less frequent than asteroids
    SPAWN_Y_MIN: 100,
    SPAWN_Y_MAX: 620,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 6,
    FIRE_RATE: 2000, // Fires every 2 seconds
    BULLET_SPEED: -300,
    BULLET_SCALE: 0.15,
};

export const LEAPER_CONFIG = {
    SCALE: 0.55,
    SPEED: -280,
    SPAWN_INTERVAL: 3500, // Moderate frequency
    SPAWN_Y_MIN: 150,
    SPAWN_Y_MAX: 570,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 8,
    ZIGZAG_AMPLITUDE: 150, // Height of zigzag
    ZIGZAG_FREQUENCY: 0.005, // Speed of zigzag pattern
};

export const SCORE_CONFIG = {
    ASTEROID: 10,
    KAMIKAZE: 20,
    GUNNER: 15,
    LEAPER: 25,
};
