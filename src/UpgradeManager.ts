import {
    UPGRADE_CONFIG,
    UPGRADE_DEFINITIONS,
    UpgradeData,
    BULLET_CONFIG,
} from './config/constants';

export class UpgradeManager {
    private activeUpgrades: Set<string> = new Set();
    private availableUpgrades: UpgradeData[] = []; // Pool of upgrades that can still be selected
    private pendingDelayedUpgrades: number = 0; // Number of delayed upgrades to trigger next wave
    private currentWaveUpgradeSelections: number = 0; // Remaining upgrade selections for current wave

    // Asset loading
    static preload(scene: Phaser.Scene): void {
        scene.load.image('upgrade-damage', 'assets/images/upgrades/upgrade-damage.png');
        scene.load.image('upgrade-health', 'assets/images/upgrades/upgrade-health.png');
        scene.load.image('upgrade-rate-of-fire', 'assets/images/upgrades/upgrade-rate-of-fire.png');
        scene.load.image('upgrade-shield', 'assets/images/upgrades/upgrade-shield.png');
        scene.load.image('upgrade-regeneration', 'assets/images/upgrades/upgrade-regeneration.png');
        scene.load.image('upgrade-vampirism', 'assets/images/upgrades/upgrade-vampirism.png');
        scene.load.image('upgrade-acid', 'assets/images/upgrades/upgrade-acid.png');
        scene.load.image('upgrade-engine', 'assets/images/upgrades/upgrade-engine.png');
        scene.load.image('upgrade-ghost', 'assets/images/upgrades/upgrade-ghost.png');
        scene.load.image('upgrade-interceptor', 'assets/images/upgrades/upgrade-interceptor.png');
        scene.load.image(
            'upgrade-projectile-speed',
            'assets/images/upgrades/upgrade-projectile-speed.png'
        );
        scene.load.image('upgrade-rebirth', 'assets/images/upgrades/upgrade-rebirth.png');
        scene.load.image('upgrade-aoe', 'assets/images/upgrades/upgrade-aoe.png');
        scene.load.image('upgrade-healing', 'assets/images/upgrades/upgrade-healing.png');
        scene.load.image('upgrade-later', 'assets/images/upgrades/upgrade-later.png');
        scene.load.image('upgrade-projectile', 'assets/images/upgrades/upgrade-projectile.png');
    }

    constructor() {
        // Initialize available upgrades pool with all upgrades
        this.availableUpgrades = [...UPGRADE_DEFINITIONS];
        console.log(
            `[UPGRADE] Initialized with ${this.availableUpgrades.length} available upgrades`
        );
    }

    // Check if player has a specific upgrade
    hasUpgrade(upgradeId: string): boolean {
        return this.activeUpgrades.has(upgradeId);
    }

    // Apply an upgrade to the player
    applyUpgrade(upgradeId: string): void {
        // Check if it's an instant upgrade
        if (this.isInstantUpgrade(upgradeId)) {
            // Instant upgrades: remove from pool but don't add to permanent upgrades
            this.availableUpgrades = this.availableUpgrades.filter(
                (upgrade) => upgrade.id !== upgradeId
            );
            console.log(
                `[UPGRADE] Applied instant upgrade: ${upgradeId} (${this.availableUpgrades.length} upgrades remaining)`
            );
            return;
        }

        if (this.activeUpgrades.has(upgradeId)) {
            console.warn(`Upgrade ${upgradeId} already applied`);
            return;
        }

        this.activeUpgrades.add(upgradeId);

        // Remove from available upgrades pool
        this.availableUpgrades = this.availableUpgrades.filter(
            (upgrade) => upgrade.id !== upgradeId
        );

        console.log(
            `[UPGRADE] Applied upgrade: ${upgradeId} (${this.availableUpgrades.length} upgrades remaining)`
        );
    }

    // Get current damage multiplier
    getDamageMultiplier(): number {
        return this.hasUpgrade(UPGRADE_CONFIG.DAMAGE) ? UPGRADE_CONFIG.DAMAGE_MULTIPLIER : 1;
    }

    // Get current health multiplier
    getHealthMultiplier(): number {
        return this.hasUpgrade(UPGRADE_CONFIG.HEALTH) ? UPGRADE_CONFIG.HEALTH_MULTIPLIER : 1;
    }

    // Get current fire rate multiplier
    getFireRateMultiplier(): number {
        return this.hasUpgrade(UPGRADE_CONFIG.RATE_OF_FIRE)
            ? UPGRADE_CONFIG.FIRE_RATE_MULTIPLIER
            : 1;
    }

    // Get shield damage reduction
    getShieldDamageReduction(): number {
        return this.hasUpgrade(UPGRADE_CONFIG.SHIELD) ? UPGRADE_CONFIG.SHIELD_DAMAGE_REDUCTION : 0;
    }

    // Check if auto-repair is active
    hasAutoRepair(): boolean {
        return this.hasUpgrade(UPGRADE_CONFIG.AUTO_REPAIR);
    }

    // Check if energy siphon is active
    hasEnergySiphon(): boolean {
        return this.hasUpgrade(UPGRADE_CONFIG.ENERGY_SIPHON);
    }

    // Get auto-repair amount per tick
    getAutoRepairAmount(): number {
        return this.hasAutoRepair() ? UPGRADE_CONFIG.AUTO_REPAIR_AMOUNT : 0;
    }

    // Get energy siphon heal ratio
    getEnergySiphonRatio(): number {
        return this.hasEnergySiphon() ? UPGRADE_CONFIG.ENERGY_SIPHON_RATIO : 0;
    }

    // Check if acid bullets are active
    hasAcidBullets(): boolean {
        return this.hasUpgrade(UPGRADE_CONFIG.ACID_BULLETS);
    }

    // Check if engine upgrade is active
    hasEngineUpgrade(): boolean {
        return this.hasUpgrade(UPGRADE_CONFIG.ENGINE);
    }

    // Get engine speed multiplier
    getEngineSpeedMultiplier(): number {
        return this.hasEngineUpgrade() ? UPGRADE_CONFIG.ENGINE_SPEED_MULTIPLIER : 1;
    }

    // Check if phase shield is active
    hasPhaseShield(): boolean {
        return this.hasUpgrade(UPGRADE_CONFIG.PHASE_SHIELD);
    }

    // Check if interceptor is active
    hasInterceptor(): boolean {
        return this.hasUpgrade(UPGRADE_CONFIG.INTERCEPTOR);
    }

    // Check if projectile speed upgrade is active
    hasProjectileSpeed(): boolean {
        return this.hasUpgrade(UPGRADE_CONFIG.PROJECTILE_SPEED);
    }

    // Check if rebirth upgrade is active
    hasRebirth(): boolean {
        return this.hasUpgrade(UPGRADE_CONFIG.REBIRTH);
    }

    // Check if AOE bullets are active
    hasAOEBullets(): boolean {
        return this.hasUpgrade(UPGRADE_CONFIG.AOE_BULLETS);
    }

    // Check if bullet size upgrade is active
    hasBulletSize(): boolean {
        return this.hasUpgrade(UPGRADE_CONFIG.BULLET_SIZE);
    }

    // Check if upgrade is an instant effect (not permanent)
    isInstantUpgrade(upgradeId: string): boolean {
        return (
            upgradeId === UPGRADE_CONFIG.INSTANT_HEAL ||
            upgradeId === UPGRADE_CONFIG.DELAYED_UPGRADE
        );
    }

    // Check if upgrade is a delayed effect
    isDelayedUpgrade(upgradeId: string): boolean {
        return upgradeId === UPGRADE_CONFIG.DELAYED_UPGRADE;
    }

    // Add delayed upgrade (doesn't affect current wave, affects next wave)
    addDelayedUpgrade(): void {
        this.pendingDelayedUpgrades += 3; // Add 3 upgrade selections for next wave
        console.log(
            `[DELAYED_UPGRADE] Added delayed upgrade - ${this.pendingDelayedUpgrades} total pending`
        );
    }

    // Check if there are pending delayed upgrades
    hasPendingDelayedUpgrades(): boolean {
        return this.pendingDelayedUpgrades > 0;
    }

    // Initialize upgrade selections for current wave (call this when starting upgrade selection)
    initializeWaveUpgrades(): number {
        this.currentWaveUpgradeSelections = Math.min(
            1 + this.pendingDelayedUpgrades,
            this.availableUpgrades.length
        );
        console.log(
            `[UPGRADE] Initialized ${this.currentWaveUpgradeSelections} upgrade selections for current wave`
        );
        return this.currentWaveUpgradeSelections;
    }

    // Get remaining upgrade selections for current wave
    getRemainingUpgradeSelections(): number {
        return this.currentWaveUpgradeSelections;
    }

    // Consume one upgrade selection (either normal or delayed)
    consumeUpgradeSelection(): void {
        if (this.currentWaveUpgradeSelections > 0) {
            this.currentWaveUpgradeSelections--;

            // Also consume delayed upgrade if we have them
            if (this.pendingDelayedUpgrades > 0) {
                this.pendingDelayedUpgrades--;
                console.log(
                    `[DELAYED_UPGRADE] Consumed delayed upgrade - ${this.pendingDelayedUpgrades} pending for future waves`
                );
            }

            console.log(
                `[UPGRADE] Consumed upgrade selection - ${this.currentWaveUpgradeSelections} remaining this wave`
            );
        }
    }

    // Consume rebirth upgrade (remove it after use)
    consumeRebirth(): boolean {
        if (this.hasRebirth()) {
            this.activeUpgrades.delete(UPGRADE_CONFIG.REBIRTH);
            console.log(
                '[REBIRTH] Rebirth upgrade consumed - wave restarting instead of game over'
            );
            return true;
        }
        return false;
    }

    // Calculate bullet speed based on upgrades
    calculateBulletSpeed(): number {
        let speed = BULLET_CONFIG.SPEED;

        if (this.hasProjectileSpeed()) {
            speed *= UPGRADE_CONFIG.PROJECTILE_SPEED_MULTIPLIER;
        }

        return speed;
    }

    // Calculate bullet scale based on upgrades
    calculateBulletScale(): number {
        let scale = BULLET_CONFIG.SCALE;

        if (this.hasBulletSize()) {
            scale *= UPGRADE_CONFIG.BULLET_SIZE_MULTIPLIER;
        }

        return scale;
    }

    // Calculate actual damage based on upgrades
    calculateDamage(baseDamage: number): number {
        if (this.hasUpgrade(UPGRADE_CONFIG.DAMAGE)) {
            // Add base damage instead of multiplying (8 + 8 = 16 instead of 8 * 2 = 16)
            // This makes the upgrade less powerful when combined with other damage sources
            return Math.round(baseDamage + BULLET_CONFIG.BASE_DAMAGE);
        }
        return baseDamage;
    }

    // Calculate actual max HP based on upgrades
    calculateMaxHP(baseMaxHP: number): number {
        return Math.round(baseMaxHP * this.getHealthMultiplier());
    }

    // Calculate actual fire rate based on upgrades
    calculateFireRate(baseFireRate: number): number {
        return Math.round(baseFireRate / this.getFireRateMultiplier());
    }

    // Calculate actual movement speed based on upgrades
    calculateMovementSpeed(baseSpeed: number): number {
        return Math.round(baseSpeed * this.getEngineSpeedMultiplier());
    }

    // Calculate incoming damage after shield reduction
    calculateIncomingDamage(incomingDamage: number): number {
        if (this.hasUpgrade(UPGRADE_CONFIG.SHIELD)) {
            // Reduce damage by half, round up
            return Math.ceil(incomingDamage * (1 - this.getShieldDamageReduction()));
        }
        return incomingDamage;
    }

    // Get all available upgrades
    getAvailableUpgrades(): UpgradeData[] {
        return UPGRADE_DEFINITIONS;
    }

    // Get random available upgrades for selection (only from remaining pool)
    getRandomUpgrades(count: number = 4): UpgradeData[] {
        // If not enough upgrades available, return all remaining
        if (this.availableUpgrades.length <= count) {
            return [...this.availableUpgrades];
        }

        // Get a copy of available upgrades
        const upgradesCopy = [...this.availableUpgrades];

        // Shuffle the array
        for (let i = upgradesCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [upgradesCopy[i], upgradesCopy[j]] = [upgradesCopy[j], upgradesCopy[i]];
        }

        // Return first 'count' upgrades
        return upgradesCopy.slice(0, count);
    }

    // Get list of active upgrade IDs
    getActiveUpgrades(): string[] {
        return Array.from(this.activeUpgrades);
    }

    // Check if there are upgrades available for selection
    hasAvailableUpgrades(): boolean {
        return this.availableUpgrades.length > 0;
    }

    // Get count of available upgrades
    getAvailableUpgradeCount(): number {
        return this.availableUpgrades.length;
    }

    // Reset all upgrades (for restart)
    reset(): void {
        this.activeUpgrades.clear();
        this.availableUpgrades = [...UPGRADE_DEFINITIONS]; // Restore full pool
        this.pendingDelayedUpgrades = 0; // Reset delayed upgrades
        this.currentWaveUpgradeSelections = 0; // Reset current wave selections
        console.log(
            `[UPGRADE] All upgrades reset - ${this.availableUpgrades.length} upgrades available`
        );
    }

    // Debug: Get upgrade status
    getUpgradeStatus(): string {
        const upgrades = this.getActiveUpgrades();
        if (upgrades.length === 0) {
            return 'No upgrades active';
        }
        return `Active upgrades: ${upgrades.join(', ')}`;
    }
}
