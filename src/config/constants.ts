// Game constants and sprite configurations
export const GAME_CONFIG = {
    WIDTH: 1280,
    HEIGHT: 720,
};

export const PLAYER_CONFIG = {
    SCALE: 0.5,
    SPEED: 300,
    FIRE_RATE: 200, // ms between shots
    START_X: 200,
    START_Y: 360,
};

export const ASTEROID_CONFIG = {
    SCALE: 0.5,
    SPEED: -300,
    SPAWN_INTERVAL: 2000, // ms
    SPAWN_Y_MIN: 100,
    SPAWN_Y_MAX: 620,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 15, // Увеличенный пул для обработки одновременных уничтожений
};

export const BULLET_CONFIG = {
    SCALE: 0.1,
    SPEED: 400,
    MAX_POOL_SIZE: 20,
    OFFSET_X: 50, // Distance from player center
}; 