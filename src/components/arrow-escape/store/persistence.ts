import type { PersistedState } from "@/components/arrow-escape/types/game";

/**
 * store/persistence.ts — the only place that touches localStorage directly.
 * Every read/write is wrapped in try/catch: private browsing, disabled
 * storage, or a full quota can all throw, and none of that should ever
 * crash the game — it should just silently fall back to defaults / no-op.
 */

const STORAGE_KEY = "arrow-escape:save:v1";

export const DEFAULT_PERSISTED_STATE: PersistedState = {
  coins: 0,
  currentLevelIndex: 1,
  boosters: {
    hintCount: 3,
    eraserCount: 3,
  },
  settings: {
    soundEnabled: true,
    musicEnabled: true,
  },
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadPersistedState(): PersistedState {
  if (!isBrowser()) return DEFAULT_PERSISTED_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERSISTED_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    // Merge over defaults so a save from an older schema version with
    // missing fields still produces a valid, fully-populated state.
    return {
      coins: parsed.coins ?? DEFAULT_PERSISTED_STATE.coins,
      currentLevelIndex: parsed.currentLevelIndex ?? DEFAULT_PERSISTED_STATE.currentLevelIndex,
      boosters: {
        hintCount: parsed.boosters?.hintCount ?? DEFAULT_PERSISTED_STATE.boosters.hintCount,
        eraserCount: parsed.boosters?.eraserCount ?? DEFAULT_PERSISTED_STATE.boosters.eraserCount,
      },
      settings: {
        soundEnabled: parsed.settings?.soundEnabled ?? DEFAULT_PERSISTED_STATE.settings.soundEnabled,
        musicEnabled: parsed.settings?.musicEnabled ?? DEFAULT_PERSISTED_STATE.settings.musicEnabled,
      },
    };
  } catch {
    return DEFAULT_PERSISTED_STATE;
  }
}

export function savePersistedState(state: PersistedState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full / disabled / private browsing — silently drop the save.
  }
}
