"use client";

import { useCallback, useEffect, useRef } from "react";
import { easeInOutCubic, getSlideDurationMs } from "@/components/arrow-escape/engine/AnimationEngine";

interface UseThreadPullAnimationArgs {
  active: boolean;
  /** The arrow's own path length in cell-units (cells.length - 1). */
  pathLength: number;
  onComplete: () => void;
}
export function useThreadPullAnimation({ active, pathLength, onComplete }: UseThreadPullAnimationArgs) {
  const targetsRef = useRef<SVGPathElement[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  /** Pass this as the `ref` prop on each stroked path (outline + body) that should erase together. */
  const registerTarget = useCallback((el: SVGPathElement | null) => {
    if (el && !targetsRef.current.includes(el)) {
      targetsRef.current.push(el);
    }
  }, []);

  useEffect(() => {
    if (!active) {
      targetsRef.current.forEach((el) => el.removeAttribute("stroke-dashoffset"));
      return;
    }

    // Degenerate case: a single-cell arrow has no body to erase along —
    // just let it vanish quickly rather than animating a zero-length dash.
    if (pathLength <= 0) {
      const t = setTimeout(() => onCompleteRef.current(), 160);
      return () => clearTimeout(t);
    }

    const durationMs = getSlideDurationMs(pathLength);
    let rafId: number;
    let startTime: number | null = null;

    const frame = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = easeInOutCubic(elapsed / durationMs);
      const consumed = progress * pathLength; // how much of the TAIL side has been pulled through
      targetsRef.current.forEach((el) => el.setAttribute("stroke-dashoffset", String(-consumed)));

      if (elapsed < durationMs) {
        rafId = requestAnimationFrame(frame);
      } else {
        onCompleteRef.current();
      }
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [active, pathLength]);

  return registerTarget;
}