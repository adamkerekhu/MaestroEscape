import { Howl, Howler } from 'howler';
import { ROOM_AMBIENT_RADII } from '@among-us/shared';

// ---------- constants ----------

const FOOTSTEP_INTERVAL = 230; // ms, from settings.py stepping_rate

const SOUND_BASE = '/assets/sounds';

// Footstep variants (randomised each step)
const FOOTSTEP_FILES = Array.from({ length: 8 }, (_, i) =>
  `${SOUND_BASE}/Footsteps/Footstep0${i + 1}.wav`,
);

// One-shot SFX keyed by logical name
const SFX_FILES: Record<string, string> = {
  round_start: `${SOUND_BASE}/General/roundstart.wav`,
  emergency_alarm: `${SOUND_BASE}/General/alarm_emergencymeeting.wav`,
  body_found: `${SOUND_BASE}/General/report_Bodyfound.wav`,
  crisis_alarm: `${SOUND_BASE}/General/crises.wav`,
  invisible: `${SOUND_BASE}/General/swap.wav`,
  vent: `${SOUND_BASE}/General/vent.wav`,
  victory_crew: `${SOUND_BASE}/General/victory_crew.wav`,
  victory_impostor: `${SOUND_BASE}/General/victory_impostor.wav`,
  game_left: `${SOUND_BASE}/General/victory_disconnect.wav`,
  fill_gas_can: `${SOUND_BASE}/General/gas_can_fill.wav`,
  pick_gas_can: `${SOUND_BASE}/General/pick_up_gas_can.wav`,
  task_complete: `${SOUND_BASE}/General/task_complete.wav`,
  kill: `${SOUND_BASE}/Kill/imposter_kill.wav`,
  kill_cooldown: `${SOUND_BASE}/Kill/imposter_kill_cooldown.wav`,
  kill_victim: `${SOUND_BASE}/Kill/imposter_kill_victim.wav`,
  menu_select: `${SOUND_BASE}/UI/select.wav`,
  go_back: `${SOUND_BASE}/UI/back2.wav`,
  selected: `${SOUND_BASE}/UI/selected2.wav`,
  pause: `${SOUND_BASE}/UI/pause.wav`,
  backspace: `${SOUND_BASE}/UI/backspace.wav`,
  keypress: `${SOUND_BASE}/UI/keypress.wav`,
  map_click: `${SOUND_BASE}/UI/map_btn_click.wav`,
  vote: `${SOUND_BASE}/UI/votescreen_locking.wav`,
};

// BGM tracks
const BGM_FILES: Record<string, string> = {
  main: `${SOUND_BASE}/Ambience/AMB_Main.wav`,
  main_menu: `${SOUND_BASE}/Background/main_menu_music.mp3`,
};

// Room ambient definitions: center coords (from gamefunctions.py) + sound file
interface RoomDef {
  key: keyof typeof ROOM_AMBIENT_RADII;
  centerX: number;
  centerY: number;
  file: string;
}

const ROOM_DEFS: RoomDef[] = [
  { key: 'cafeteria', centerX: 3277, centerY: 658, file: `${SOUND_BASE}/Ambience/AMB_Cafeteria.wav` },
  { key: 'medbay', centerX: 2338, centerY: 1147, file: `${SOUND_BASE}/Ambience/AMB_MedbayRoom.wav` },
  { key: 'security', centerX: 1806, centerY: 1279, file: `${SOUND_BASE}/Ambience/AMB_SecurityRoom.wav` },
  { key: 'reactor', centerX: 880, centerY: 1474, file: `${SOUND_BASE}/Ambience/AMB_ReactorRoom.wav` },
  { key: 'upper_engine', centerX: 1360, centerY: 699, file: `${SOUND_BASE}/Ambience/AMB_EngineRoom.wav` },
  { key: 'lower_engine', centerX: 1360, centerY: 2180, file: `${SOUND_BASE}/Ambience/AMB_EngineRoom.wav` },
  { key: 'electrical', centerX: 2425, centerY: 1950, file: `${SOUND_BASE}/Ambience/AMB_ElectricRoom.wav` },
  { key: 'storage', centerX: 3175, centerY: 2308, file: `${SOUND_BASE}/Ambience/AMB_Storage.wav` },
  { key: 'admin', centerX: 3920, centerY: 1775, file: `${SOUND_BASE}/Ambience/AMB_Admin.wav` },
  { key: 'communications', centerX: 3865, centerY: 2650, file: `${SOUND_BASE}/Ambience/AMB_CommsRoom.wav` },
  { key: 'oxygen', centerX: 4190, centerY: 1220, file: `${SOUND_BASE}/Ambience/AMB_Oxygen.wav` },
  { key: 'cockpit', centerX: 5405, centerY: 1340, file: `${SOUND_BASE}/Ambience/AMB_Cockpit.wav` },
  { key: 'weapons', centerX: 4500, centerY: 600, file: `${SOUND_BASE}/Ambience/AMB_Weapons.wav` },
];

// ---------- AudioManager ----------

export class AudioManager {
  private footstepSounds: Howl[] = [];
  private sfxSounds = new Map<string, Howl>();
  private bgmSounds = new Map<string, Howl>();
  private ambientSounds = new Map<string, Howl>();

  private currentBgmKey: string | null = null;
  private lastFootstepTime = 0;

  // Track which room ambients are currently playing
  private ambientPlaying = new Set<string>();

  private masterVolume = 1;
  private unlocked = false;

  loadSounds(): void {
    // Footsteps
    this.footstepSounds = FOOTSTEP_FILES.map(
      (src) => new Howl({ src: [src], volume: 0.4 }),
    );

    // SFX
    for (const [name, src] of Object.entries(SFX_FILES)) {
      this.sfxSounds.set(name, new Howl({ src: [src], volume: 0.6 }));
    }

    // BGM
    for (const [name, src] of Object.entries(BGM_FILES)) {
      this.bgmSounds.set(
        name,
        new Howl({ src: [src], loop: true, volume: 0.35 }),
      );
    }

    // Room ambients (each loops independently)
    for (const room of ROOM_DEFS) {
      this.ambientSounds.set(
        room.key,
        new Howl({ src: [room.file], loop: true, volume: 0 }),
      );
    }

    // Handle browser autoplay policy: unlock audio context on first interaction
    this.setupAutoplayUnlock();
  }

  // ---- BGM ----

  playBGM(track: string): void {
    if (this.currentBgmKey === track) return;
    this.stopBGM();
    const howl = this.bgmSounds.get(track);
    if (howl) {
      howl.play();
      this.currentBgmKey = track;
    }
  }

  stopBGM(): void {
    if (this.currentBgmKey) {
      const howl = this.bgmSounds.get(this.currentBgmKey);
      howl?.fade(howl.volume(), 0, 500);
      setTimeout(() => howl?.stop(), 500);
      this.currentBgmKey = null;
    }
  }

  // ---- Footsteps ----

  playFootstep(): void {
    const now = performance.now();
    if (now - this.lastFootstepTime < FOOTSTEP_INTERVAL) return;
    this.lastFootstepTime = now;

    const idx = Math.floor(Math.random() * this.footstepSounds.length);
    this.footstepSounds[idx].play();
  }

  // ---- One-shot SFX ----

  playSFX(name: string): void {
    const howl = this.sfxSounds.get(name);
    if (howl) {
      howl.play();
    }
  }

  // ---- Distance-based room ambient sounds ----

  updateAmbient(playerX: number, playerY: number): void {
    for (const room of ROOM_DEFS) {
      const dx = playerX - room.centerX;
      const dy = playerY - room.centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = ROOM_AMBIENT_RADII[room.key];
      const howl = this.ambientSounds.get(room.key);
      if (!howl) continue;

      if (dist <= radius) {
        // Volume scales linearly: 1 at center, 0 at edge
        const targetVol = Math.max(0, 1 - dist / radius) * 0.5;

        if (!this.ambientPlaying.has(room.key)) {
          // Start playing (from silence) then fade in
          howl.volume(0);
          howl.play();
          this.ambientPlaying.add(room.key);
        }
        howl.fade(howl.volume(), targetVol, 200);
      } else if (this.ambientPlaying.has(room.key)) {
        // Player left the radius - fade out then stop
        howl.fade(howl.volume(), 0, 1000);
        this.ambientPlaying.delete(room.key);
        setTimeout(() => {
          // Only stop if still not playing (player might have re-entered)
          if (!this.ambientPlaying.has(room.key)) {
            howl.stop();
          }
        }, 1000);
      }
    }
  }

  // ---- Volume ----

  setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    Howler.volume(this.masterVolume);
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  // ---- Cleanup ----

  destroy(): void {
    Howler.unload();
    this.footstepSounds = [];
    this.sfxSounds.clear();
    this.bgmSounds.clear();
    this.ambientSounds.clear();
    this.ambientPlaying.clear();
    this.currentBgmKey = null;
  }

  // ---- Autoplay unlock ----

  private setupAutoplayUnlock(): void {
    if (this.unlocked) return;

    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;

      // Resume the Howler audio context if it was suspended
      const ctx = Howler.ctx;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }

      document.removeEventListener('click', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };

    document.addEventListener('click', unlock, true);
    document.addEventListener('touchstart', unlock, true);
    document.addEventListener('keydown', unlock, true);
  }
}

// Singleton instance
let audioManager: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManager) {
    audioManager = new AudioManager();
  }
  return audioManager;
}
