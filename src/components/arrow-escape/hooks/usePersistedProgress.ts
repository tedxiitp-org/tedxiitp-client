"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PersistedState } from "@/components/arrow-escape/types/game";
import { DEFAULT_PERSISTED_STATE, loadPersistedState, savePersistedState } from "@/components/arrow-escape/store/persistence";
import { setSoundEnabled } from "@/components/arrow-escape/utils/sound";

/**
 * usePersistedProgress — owns the cross-level save data (coins bank,
 * current level index, booster inventory, settings) and keeps it in sync
 * with localStorage.
 *
 * Load/save ordering matters here: we initialize React state to DEFAULTS
 * (so server-rendered and first-client-render markup match, avoiding a
 * hydration mismatch), then load the real saved values in a useEffect after
 * mount. A `hasLoadedRef` guard prevents the save-effect from firing with
 * the placeholder defaults and clobbering an existing save before the load
 * has actually happened.
 */
export function usePersistedProgress() {
  const [state, setState] = useState<PersistedState>(DEFAULT_PERSISTED_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loaded = loadPersistedState();
    setState(loaded);
    setSoundEnabled(loaded.settings.soundEnabled);
    hasLoadedRef.current = true;
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    savePersistedState(state);
  }, [state]);

  const addCoins = useCallback((amount: number) => {
    if (amount === 0) return;
    setState((prev) => ({ ...prev, coins: prev.coins + amount }));
  }, []);

  const setHintCount = useCallback((count: number) => {
    setState((prev) => ({ ...prev, boosters: { ...prev.boosters, hintCount: count } }));
  }, []);

  const setEraserCount = useCallback((count: number) => {
    setState((prev) => ({ ...prev, boosters: { ...prev.boosters, eraserCount: count } }));
  }, []);

  const advanceLevel = useCallback(() => {
    setState((prev) => ({ ...prev, currentLevelIndex: prev.currentLevelIndex + 1 }));
  }, []);

  const setSoundSetting = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    setState((prev) => ({ ...prev, settings: { ...prev.settings, soundEnabled: enabled } }));
  }, []);

  const setMusicSetting = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, musicEnabled: enabled } }));
  }, []);

  return {
    persisted: state,
    isLoaded,
    addCoins,
    setHintCount,
    setEraserCount,
    advanceLevel,
    setSoundSetting,
    setMusicSetting,
  };
}
