import { UPGRADE_CONFIG, UPGRADE_DEFINITIONS, UpgradeData } from './config/constants';

export class UpgradeManager {
    // Asset loading
    static preload(scene: Phaser.Scene): void {
        scene.load.image('upgrade-damage', 'assets/upgrade-damage.png');
        scene.load.image('upgrade-health', 'assets/upgrade-health.png');
        scene.load.image('upgrade-rate-of-fire', 'assets/upgrade-rate-of-fire.png');
        scene.load.image('upgrade-shield', 'assets/upgrade-shield.png');
    }

    private activeUpgrades: Set<string> = new Set();

    constructor() {
        // Initialize with no upgrades
    }

    // Check if player has a specific upgrade
    hasUpgrade(upgradeId: string): boolean {
        return this.activeUpgrades.has(upgradeId);
    }

    // Apply an upgrade to the player
    applyUpgrade(upgradeId: string): void {
        if (this.activeUpgrades.has(upgradeId)) {
            console.warn(`Upgrade ${upgradeId} already applied`);
            return;
        }

        this.activeUpgrades.add(upgradeId);
        console.log(`[UPGRADE] Applied upgrade: ${upgradeId}`);
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

    // Calculate actual damage based on upgrades
    calculateDamage(baseDamage: number): number {
        return Math.round(baseDamage * this.getDamageMultiplier());
    }

    // Calculate actual max HP based on upgrades
    calculateMaxHP(baseMaxHP: number): number {
        return Math.round(baseMaxHP * this.getHealthMultiplier());
    }

    // Calculate actual fire rate based on upgrades
    calculateFireRate(baseFireRate: number): number {
        return Math.round(baseFireRate / this.getFireRateMultiplier());
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

    // Get list of active upgrade IDs
    getActiveUpgrades(): string[] {
        return Array.from(this.activeUpgrades);
    }

    // Reset all upgrades (for restart)
    reset(): void {
        this.activeUpgrades.clear();
        console.log('[UPGRADE] All upgrades reset');
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
