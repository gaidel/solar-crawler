// Game constants and sprite configurations
export const GAME_CONFIG = {
    WIDTH: 1280,
    HEIGHT: 720,
    WIN_TIME: 60000, // Victory time in milliseconds (1 minute)
    BACKGROUND_SCROLL_SPEED: 2,
    TOTAL_WAVES: 8, // Total number of waves to complete the game
    WAVE_DURATION: 60000, // Duration of each wave in milliseconds (60 seconds)
};

// Wave difficulty modifiers for spawn frequency
export const WAVE_MODIFIERS = {
    1: 1.0, // Normal frequency (100%)
    2: 1.0, // Normal frequency (100%)
    3: 1.0, // Normal frequency (100%)
    4: 1.0, // Normal frequency (100%)
    5: 1.1, // +10% spawn frequency (90% interval)
    6: 1.2, // +20% spawn frequency (83% interval)
    7: 1.5, // +50% spawn frequency (67% interval)
    8: 1.5, // +50% spawn frequency (67% interval)
};

export const UI_CONFIG = {
    FONT_SIZE_LARGE: '48px',
    FONT_SIZE_MEDIUM: '32px',
    FONT_SIZE_SMALL: '24px',
    BUTTON_PADDING: 20,
    OVERLAY_ALPHA: 0.7,
    HUD_HEIGHT: 40, // Reserved space at top for HUD
};

// Rendering depth/z-index configuration for proper layering
export const DEPTH_CONFIG = {
    // Background layer (lowest)
    BACKGROUND: 0,
    
    // Projectiles layer (above background, behind characters)
    ENEMY_BULLETS: 5,
    PLAYER_BULLETS: 6,
    
    // Regular enemies layer (above projectiles)
    ASTEROIDS: 10,
    GUNNERS: 11,
    KAMIKAZES: 12,
    LEAPERS: 13,
    
    // Boss enemies layer (above regular enemies)
    MOTHERSHIP: 20,
    
    // Player layer (above enemies)
    PLAYER: 30,
    
    // Effects layer (above player)
    EXPLOSIONS: 40,
    
    // HUD layer (above effects)
    HUD_ELEMENTS: 100,
    HUD_TEXT: 101,
    
    // UI Overlays layer (highest)
    PAUSE_MENU: 200,
    UPGRADE_SCREEN: 201,
    SETTINGS_MENU: 202,
    CONFIRMATION_DIALOG: 203,
    GAME_OVER_SCREEN: 204,
    VICTORY_SCREEN: 205,
} as const;

export const PLAYER_CONFIG = {
    START_X: 100,
    START_Y: 400, // Moved down to avoid HUD area
    SCALE: 0.8,
    SPEED: 300,
    BASE_FIRE_RATE: 600, // Base fire rate (slow) - upgraded to 300ms with rate-of-fire upgrade
    MOVEMENT_Y_MIN: 60, // Can't move above HUD area
    MOVEMENT_Y_MAX: 680, // Can't move below screen
    BASE_MAX_HP: 100, // Base max HP - upgraded to 200 with health upgrade
};

export const ASTEROID_CONFIG = {
    // Common settings
    SPAWN_INTERVAL: 2000, // ms
    SPAWN_Y_MIN: 60, // Below HUD area
    SPAWN_Y_MAX: 620,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 15, // Enlarged pool to handle simultaneous destructions

    // Normal asteroid settings
    NORMAL: {
        SCALE: 0.5,
        SPEED: -300,
        MAX_HP: 40, // Takes 4 hits to destroy
        COLLISION_DAMAGE: 100, // Damage to player
        SCORE_VALUE: 10,
        SPAWN_WEIGHT: 70, // 70% chance to spawn normal asteroid
    },

    // Large asteroid settings (2x everything)
    LARGE: {
        SCALE: 1.0, // 2x radius
        SPEED: -150, // 2x slower
        MAX_HP: 80, // 2x HP (takes 8 hits)
        COLLISION_DAMAGE: 200, // 2x damage (still instant kill but for consistency)
        SCORE_VALUE: 20, // 2x score
        SPAWN_WEIGHT: 30, // 30% chance to spawn large asteroid
    },
};

export const KAMIKAZE_CONFIG = {
    // Common settings
    SPAWN_INTERVAL: 4000, // Less frequent than asteroids
    SPAWN_Y_MIN: 60, // Below HUD area
    SPAWN_Y_MAX: 620,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 8,

    // Normal kamikaze settings
    NORMAL: {
        SCALE: 0.5, // Scale for new sprite 170x120 -> 85x60
        HOMING_SPEED: 180, // Total movement speed towards player
        MAX_HP: 20, // Takes 2 hits to destroy
        COLLISION_DAMAGE: 50, // Damage to player
        SCORE_VALUE: 20,
        SPAWN_WEIGHT: 70, // 70% chance to spawn normal kamikaze
    },

    // Fast kamikaze settings (2x speed, 0.5x HP and damage, 0.5x size)
    FAST: {
        SCALE: 0.25, // 0.5x size (half of normal kamikaze)
        HOMING_SPEED: 360, // 2x speed
        MAX_HP: 10, // 0.5x HP (takes 1 hit)
        COLLISION_DAMAGE: 25, // 0.5x damage
        SCORE_VALUE: 15, // Slightly less score due to easier to kill
        SPAWN_WEIGHT: 30, // 30% chance to spawn fast kamikaze
    },
};

export const BULLET_CONFIG = {
    SCALE: 0.1,
    SPEED: 400,
    MAX_POOL_SIZE: 20,
    OFFSET_X: 50, // Distance from player center
    BASE_DAMAGE: 8, // Base damage - upgraded to 16 with damage upgrade
};

export const GUNNER_CONFIG = {
    // Common settings
    SPAWN_INTERVAL: 5000, // Less frequent than asteroids
    SPAWN_Y_MIN: 60, // Below HUD area
    SPAWN_Y_MAX: 620,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 6,
    FIRE_RATE: 2000, // Fires every 2 seconds

    // Normal gunner settings
    NORMAL: {
        SCALE: 0.6,
        SPEED: -180, // Slower movement - more time to shoot
        MAX_HP: 20, // Takes 2 hits to destroy
        COLLISION_DAMAGE: 50, // Damage to player
        SCORE_VALUE: 15,
        BULLET_SPEED: -400, // Faster bullets
        BULLET_SCALE: 0.15,
        SPAWN_WEIGHT: 70, // 70% chance to spawn normal gunner
    },

    // Large gunner settings (2x everything)
    LARGE: {
        SCALE: 1.2, // 2x size
        SPEED: -90, // 2x slower
        MAX_HP: 40, // 2x HP (takes 4 hits)
        COLLISION_DAMAGE: 100, // 2x damage
        SCORE_VALUE: 30, // 2x score
        BULLET_SPEED: -400, // Same bullet speed
        BULLET_SCALE: 0.3, // 2x bullet size
        SPAWN_WEIGHT: 30, // 30% chance to spawn large gunner
    },
};

export const LEAPER_CONFIG = {
    // Common settings
    SPAWN_INTERVAL: 3500, // Moderate frequency
    SPAWN_Y_MIN: 110, // Below HUD area with extra space for zigzag
    SPAWN_Y_MAX: 570,
    SPAWN_X: 1380,
    MAX_POOL_SIZE: 8,

    // Normal leaper settings
    NORMAL: {
        SCALE: 0.55,
        SPEED: -280,
        MAX_HP: 40, // Takes 4 hits to destroy
        COLLISION_DAMAGE: 80, // Damage to player
        SCORE_VALUE: 25,
        ZIGZAG_AMPLITUDE: 150, // Height of zigzag
        ZIGZAG_FREQUENCY: 0.002, // Speed of zigzag pattern (slower = longer waves)
        SPAWN_WEIGHT: 40, // 40% chance to spawn normal leaper
    },

    // Wide leaper settings (2x amplitude)
    WIDE: {
        SCALE: 0.55,
        SPEED: -280,
        MAX_HP: 40, // Same HP
        COLLISION_DAMAGE: 80, // Same damage
        SCORE_VALUE: 25, // Same score
        ZIGZAG_AMPLITUDE: 300, // 2x amplitude - wider zigzag
        ZIGZAG_FREQUENCY: 0.002, // Same frequency
        SPAWN_WEIGHT: 30, // 30% chance to spawn wide leaper
    },

    // Slow leaper settings (0.5x frequency = 2x period)
    SLOW: {
        SCALE: 0.55,
        SPEED: -280,
        MAX_HP: 40, // Same HP
        COLLISION_DAMAGE: 80, // Same damage
        SCORE_VALUE: 25, // Same score
        ZIGZAG_AMPLITUDE: 150, // Same amplitude
        ZIGZAG_FREQUENCY: 0.001, // 0.5x frequency - slower, longer waves
        SPAWN_WEIGHT: 30, // 30% chance to spawn slow leaper
    },
};

export const SCORE_CONFIG = {
    ASTEROID_NORMAL: 10,
    ASTEROID_LARGE: 20,
    KAMIKAZE_NORMAL: 20,
    KAMIKAZE_FAST: 15,
    GUNNER_NORMAL: 15,
    GUNNER_LARGE: 30,
    LEAPER_NORMAL: 25,
    LEAPER_WIDE: 25,
    LEAPER_SLOW: 25,
};

export const DAMAGE_CONFIG = {
    // Damage dealt TO player
    ENEMY_BULLET: 30,
    KAMIKAZE_NORMAL_COLLISION: 50,
    KAMIKAZE_FAST_COLLISION: 25,
    GUNNER_NORMAL_COLLISION: 50,
    GUNNER_LARGE_COLLISION: 100,
    LEAPER_NORMAL_COLLISION: 80,
    LEAPER_WIDE_COLLISION: 80,
    LEAPER_SLOW_COLLISION: 80,
    ASTEROID_NORMAL_COLLISION: 100, // Instant kill
    ASTEROID_LARGE_COLLISION: 200, // Still instant kill but higher value
};

// Upgrade system configuration
export const UPGRADE_CONFIG = {
    // Upgrade types
    DAMAGE: 'damage',
    HEALTH: 'health',
    RATE_OF_FIRE: 'rate_of_fire',
    SHIELD: 'shield',
    AUTO_REPAIR: 'auto_repair',
    ENERGY_SIPHON: 'energy_siphon',
    ACID_BULLETS: 'acid_bullets',
    ENGINE: 'engine',
    PHASE_SHIELD: 'phase_shield',
    INTERCEPTOR: 'interceptor',
    PROJECTILE_SPEED: 'projectile_speed',
    REBIRTH: 'rebirth',
    AOE_BULLETS: 'aoe_bullets',
    INSTANT_HEAL: 'instant_heal',
    DELAYED_UPGRADE: 'delayed_upgrade',
    BULLET_SIZE: 'bullet_size',

    // Upgrade effects
    DAMAGE_MULTIPLIER: 2, // Double damage (5 -> 10)
    HEALTH_MULTIPLIER: 2, // Double max HP (100 -> 200)
    FIRE_RATE_MULTIPLIER: 2, // Double fire rate (600ms -> 300ms)
    SHIELD_DAMAGE_REDUCTION: 0.5, // Reduce incoming damage by half (round up)
    AUTO_REPAIR_RATE: 1000, // Heal 1 HP every 1000ms (1 second)
    AUTO_REPAIR_AMOUNT: 1, // Heal 1 HP per tick
    ENERGY_SIPHON_RATIO: 0.1, // Restore 10% of enemy max HP on kill
    ACID_DURATION: 2000, // Acid effect duration in milliseconds (2 seconds)
    ACID_TINT_COLOR: 0x44ff44, // Green tint for acid effect
    ENGINE_SPEED_MULTIPLIER: 2, // Double movement speed
    PHASE_SHIELD_DURATION: 4000, // Invincibility duration in milliseconds (4 seconds)
    PHASE_SHIELD_FLICKER_RATE: 150, // Flicker interval in milliseconds
    PROJECTILE_SPEED_MULTIPLIER: 2, // Double bullet speed
    AOE_RADIUS: 160, // 1/8 of screen width (1280/8 = 160px)
    AOE_DAMAGE_MULTIPLIER: 0.5, // AOE damage is half of bullet damage
    BULLET_SIZE_MULTIPLIER: 2, // Double bullet size

    // UI Configuration
    ICON_SCALE: 0.6, // Scale for 128x128 icons
    SELECTION_SCALE: 0.7, // Larger scale when selected
} as const;

// Define upgrade data structure
export interface UpgradeData {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export const UPGRADE_DEFINITIONS: UpgradeData[] = [
    {
        id: UPGRADE_CONFIG.DAMAGE,
        name: 'Damage Boost',
        description: 'Double your bullet damage',
        icon: 'upgrade-damage',
    },
    {
        id: UPGRADE_CONFIG.HEALTH,
        name: 'Health Boost',
        description: 'Double your maximum health',
        icon: 'upgrade-health',
    },
    {
        id: UPGRADE_CONFIG.RATE_OF_FIRE,
        name: 'Rate of Fire',
        description: 'Double your firing speed',
        icon: 'upgrade-rate-of-fire',
    },
    {
        id: UPGRADE_CONFIG.SHIELD,
        name: 'Armor Plating',
        description: 'Reduce incoming damage by half',
        icon: 'upgrade-shield',
    },
    {
        id: UPGRADE_CONFIG.AUTO_REPAIR,
        name: 'Auto-Repair',
        description: 'Regenerate 1 HP every second',
        icon: 'upgrade-regeneration',
    },
    {
        id: UPGRADE_CONFIG.ENERGY_SIPHON,
        name: 'Energy Siphon',
        description: 'Restore 10% of enemy HP on kill',
        icon: 'upgrade-vampirism',
    },
    {
        id: UPGRADE_CONFIG.ACID_BULLETS,
        name: 'Acid Bullets',
        description: 'Bullets apply poison damage over time',
        icon: 'upgrade-acid',
    },
    {
        id: UPGRADE_CONFIG.ENGINE,
        name: 'Engine Upgrade',
        description: 'Double your movement speed',
        icon: 'upgrade-engine',
    },
    {
        id: UPGRADE_CONFIG.PHASE_SHIELD,
        name: 'Phase Shield',
        description: 'Invincibility after taking damage',
        icon: 'upgrade-ghost',
    },
    {
        id: UPGRADE_CONFIG.INTERCEPTOR,
        name: 'Interceptor',
        description: 'Bullets destroy enemy bullets',
        icon: 'upgrade-interceptor',
    },
    {
        id: UPGRADE_CONFIG.PROJECTILE_SPEED,
        name: 'Projectile Speed',
        description: 'Double your bullet speed',
        icon: 'upgrade-projectile-speed',
    },
    {
        id: UPGRADE_CONFIG.REBIRTH,
        name: 'Rebirth',
        description: 'Restart wave instead of game over',
        icon: 'upgrade-rebirth',
    },
    {
        id: UPGRADE_CONFIG.AOE_BULLETS,
        name: 'Explosive Rounds',
        description: 'Area damage bullets',
        icon: 'upgrade-aoe',
    },
    {
        id: UPGRADE_CONFIG.INSTANT_HEAL,
        name: 'Repair Kit',
        description: 'Restore full health',
        icon: 'upgrade-healing',
    },
    {
        id: UPGRADE_CONFIG.DELAYED_UPGRADE,
        name: 'Reserve Cache',
        description: 'Triple upgrades next wave',
        icon: 'upgrade-later',
    },
    {
        id: UPGRADE_CONFIG.BULLET_SIZE,
        name: 'Heavy Rounds',
        description: 'Double bullet size',
        icon: 'upgrade-projectile',
    },
];
