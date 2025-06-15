// Volume settings interface
export interface VolumeSettings {
    master: number;
    music: number;
    soundEffects: number;
}

export class AudioManager {
    private scene: Phaser.Scene;
    private currentMusic?: Phaser.Sound.BaseSound;
    private pendingMusicType?: 'menu' | 'game';
    private autoplayRetryCount: number = 0;
    private maxAutoplayRetries: number = 10;

    // Volume settings
    private volumeSettings: VolumeSettings = {
        master: 0.5,
        music: 0.5,
        soundEffects: 0.5,
    };

    // Base volumes for different audio types
    private baseMusicVolume = 0.4;
    private baseSoundEffectVolume = 0.3;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.loadVolumeSettings();
    }

    // Load volume settings from localStorage
    private loadVolumeSettings(): void {
        try {
            const saved = localStorage.getItem('solarCrawler_volumeSettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.volumeSettings = {
                    master: Math.max(0, Math.min(1, parsed.master || 0.5)),
                    music: Math.max(0, Math.min(1, parsed.music || 0.5)),
                    soundEffects: Math.max(0, Math.min(1, parsed.soundEffects || 0.5)),
                };
            }
        } catch (error) {
            console.warn('Failed to load volume settings:', error);
        }
    }

    // Save volume settings to localStorage
    private saveVolumeSettings(): void {
        try {
            localStorage.setItem(
                'solarCrawler_volumeSettings',
                JSON.stringify(this.volumeSettings)
            );
        } catch (error) {
            console.warn('Failed to save volume settings:', error);
        }
    }

    // Get current volume settings
    getVolumeSettings(): VolumeSettings {
        return { ...this.volumeSettings };
    }

    // Set volume for specific category
    setMasterVolume(volume: number): void {
        this.volumeSettings.master = Math.max(0, Math.min(1, volume));
        this.updateCurrentMusicVolume();
        this.saveVolumeSettings();
    }

    setMusicVolume(volume: number): void {
        this.volumeSettings.music = Math.max(0, Math.min(1, volume));
        this.updateCurrentMusicVolume();
        this.saveVolumeSettings();
    }

    setSoundEffectsVolume(volume: number): void {
        this.volumeSettings.soundEffects = Math.max(0, Math.min(1, volume));
        this.saveVolumeSettings();
    }

    // Calculate effective volume
    private getEffectiveMusicVolume(): number {
        return this.baseMusicVolume * this.volumeSettings.master * this.volumeSettings.music;
    }

    private getEffectiveSoundEffectVolume(): number {
        return (
            this.baseSoundEffectVolume *
            this.volumeSettings.master *
            this.volumeSettings.soundEffects
        );
    }

    // Update current music volume
    private updateCurrentMusicVolume(): void {
        if (this.currentMusic) {
            (this.currentMusic as any).setVolume(this.getEffectiveMusicVolume());
        }
    }

    // Static method for loading audio assets
    static preload(scene: Phaser.Scene): void {
        scene.load.audio('menuMusic', 'assets/menu.mp3');
        scene.load.audio('gameMusic', 'assets/space-ambient-cinematic-music-345394.mp3');
        scene.load.audio('shotSound', 'assets/shot.mp3');
        scene.load.audio('explosionSound', 'assets/explosion.mp3');
    }

    // Static method to stop all global audio
    static stopAllAudio(scene: Phaser.Scene): void {
        if (scene.sound) {
            scene.sound.stopAll();
        }
    }

    // Try to start music, handle autoplay policy
    private tryPlayMusic(musicKey: string, musicType: 'menu' | 'game'): void {
        this.stopCurrentMusic();

        try {
            this.currentMusic = this.scene.sound.add(musicKey, {
                loop: true,
                volume: this.getEffectiveMusicVolume(),
            });

            const playPromise = this.currentMusic.play() as any;

            // Handle promise-based play (some browsers return promise)
            if (
                playPromise &&
                typeof playPromise === 'object' &&
                typeof playPromise.then === 'function'
            ) {
                playPromise
                    .then(() => {
                        console.log(`${musicType} music started successfully`);
                        this.pendingMusicType = undefined;
                        this.autoplayRetryCount = 0;
                    })
                    .catch((error: any) => {
                        console.warn(
                            `Could not play ${musicType} music due to autoplay policy:`,
                            error
                        );
                        this.pendingMusicType = musicType;
                        this.scheduleAutoplayRetry();
                    });
            } else {
                // For non-promise returns, assume success
                console.log(`${musicType} music started successfully (non-promise)`);
                this.pendingMusicType = undefined;
                this.autoplayRetryCount = 0;
            }
        } catch (error) {
            console.warn(`Could not play ${musicType} music:`, error);
            this.pendingMusicType = musicType;
            this.scheduleAutoplayRetry();
        }
    }

    // Schedule aggressive autoplay retries
    private scheduleAutoplayRetry(): void {
        if (this.autoplayRetryCount >= this.maxAutoplayRetries) {
            console.warn(
                'Max autoplay retry attempts reached. Music will play on user interaction.'
            );
            return;
        }

        this.autoplayRetryCount++;
        const delay = Math.min(1000 * this.autoplayRetryCount, 10000); // Progressive delay up to 10s

        this.scene.time.delayedCall(delay, () => {
            if (this.pendingMusicType && !this.isMusicPlaying()) {
                console.log(
                    `Autoplay retry attempt ${this.autoplayRetryCount}/${this.maxAutoplayRetries}`
                );
                this.forcePlayMusic();
            }
        });
    }

    // Force play music (more aggressive approach)
    private forcePlayMusic(): void {
        if (!this.pendingMusicType) return;

        try {
            // Try to resume audio context if suspended (only for WebAudio)
            const soundManager = this.scene.sound as any;
            if (soundManager.context && soundManager.context.state === 'suspended') {
                soundManager.context
                    .resume()
                    .then(() => {
                        this.retryPendingMusic();
                    })
                    .catch(() => {
                        this.scheduleAutoplayRetry();
                    });
                return;
            }

            // Direct retry
            if (this.pendingMusicType === 'menu') {
                this.tryPlayMusic('menuMusic', 'menu');
            } else if (this.pendingMusicType === 'game') {
                this.tryPlayMusic('gameMusic', 'game');
            }
        } catch (error) {
            console.warn('Force play failed:', error);
            this.scheduleAutoplayRetry();
        }
    }

    // Play menu background music
    playMenuMusic(): void {
        this.tryPlayMusic('menuMusic', 'menu');
    }

    // Play game background music
    playGameMusic(): void {
        this.tryPlayMusic('gameMusic', 'game');
    }

    // Retry playing pending music (call this on user interaction)
    retryPendingMusic(): boolean {
        if (this.pendingMusicType && !this.isMusicPlaying()) {
            if (this.pendingMusicType === 'menu') {
                this.playMenuMusic();
            } else if (this.pendingMusicType === 'game') {
                this.playGameMusic();
            }

            if (this.isMusicPlaying()) {
                this.pendingMusicType = undefined;
                return true;
            }
        }
        return false;
    }

    // Check if there's pending music waiting to play
    hasPendingMusic(): boolean {
        return this.pendingMusicType !== undefined;
    }

    // Stop current music
    stopCurrentMusic(): void {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
            this.currentMusic = undefined;
        }
    }

    // Set volume (0.0 to 1.0)
    setVolume(volume: number): void {
        if (this.currentMusic) {
            (this.currentMusic as any).setVolume(Math.max(0, Math.min(1, volume)));
        }
    }

    // Pause/resume music
    pauseMusic(): void {
        if (this.currentMusic && (this.currentMusic as any).isPlaying) {
            (this.currentMusic as any).pause();
        }
    }

    resumeMusic(): void {
        if (this.currentMusic && (this.currentMusic as any).isPaused) {
            (this.currentMusic as any).resume();
        }
    }

    // Check if music is playing
    isMusicPlaying(): boolean {
        return this.currentMusic ? (this.currentMusic as any).isPlaying : false;
    }

    // Play sound effects
    playShotSound(): void {
        try {
            const sound = this.scene.sound.add('shotSound', {
                volume: this.getEffectiveSoundEffectVolume(),
            });
            sound.play();

            // Clean up sound after it finishes
            sound.once('complete', () => {
                sound.destroy();
            });
        } catch (error) {
            console.warn('Could not play shot sound:', error);
        }
    }

    playExplosionSound(volumeMultiplier: number = 1.0): void {
        try {
            const sound = this.scene.sound.add('explosionSound', {
                volume: this.getEffectiveSoundEffectVolume() * 1.3 * volumeMultiplier, // Explosion slightly louder with optional multiplier
            });
            sound.play();

            // Clean up sound after it finishes
            sound.once('complete', () => {
                sound.destroy();
            });
        } catch (error) {
            console.warn('Could not play explosion sound:', error);
        }
    }

    // Cleanup
    destroy(): void {
        this.stopCurrentMusic();
    }
}
