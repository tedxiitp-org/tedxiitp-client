"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useZoomPan — manages a screen-space CSS transform (translate + scale)
 * applied to a wrapper div around the board's <svg>. Deliberately kept in
 * screen-pixel space rather than mixed into the SVG's own viewBox/user-unit
 * coordinate system: it means none of the existing cell-unit math in
 * ArrowShape/GameBoard has to know zoom exists at all — zoom is purely a
 * "camera" layered on top.
 *
 * Supports:
 *  - Zoom ONLY via the +/- buttons (and reset-to-fit) — no wheel-zoom, no
 *    pinch-zoom. This is deliberate: zoom is a discrete, explicit action.
 *  - Panning via: mouse drag, single-finger touch drag, AND wheel/trackpad
 *    scroll (two-finger scroll on a laptop trackpad, or a mouse wheel) —
 *    scrolling moves the view left/right/up/down, it never zooms.
 */

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const BUTTON_ZOOM_STEP = 1.35;

export interface ZoomPanState {
  scale: number;
  x: number;
  y: number;
}

function clampScale(scale: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
}

/** Keeps the given screen point visually stationary while scale changes. */
function zoomAround(
  prev: ZoomPanState,
  screenX: number,
  screenY: number,
  nextScaleRaw: number
): ZoomPanState {
  const nextScale = clampScale(nextScaleRaw);
  const worldX = (screenX - prev.x) / prev.scale;
  const worldY = (screenY - prev.y) / prev.scale;
  return {
    scale: nextScale,
    x: screenX - worldX * nextScale,
    y: screenY - worldY * nextScale,
  };
}

/** Clamp pan so the board can't be dragged/scrolled entirely out of view. */
function clampPan(state: ZoomPanState, containerWidth: number, containerHeight: number): ZoomPanState {
  if (state.scale <= MIN_ZOOM) {
    return { ...state, x: 0, y: 0 };
  }
  const scaledW = containerWidth * state.scale;
  const scaledH = containerHeight * state.scale;
  const minX = containerWidth - scaledW;
  const minY = containerHeight - scaledH;
  return {
    ...state,
    x: Math.min(0, Math.max(minX, state.x)),
    y: Math.min(0, Math.max(minY, state.y)),
  };
}

export function useZoomPan() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<ZoomPanState>({ scale: 1, x: 0, y: 0 });

  const dragRef = useRef<{ active: boolean; startX: number; startY: number; originX: number; originY: number; moved: boolean }>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  const getContainerSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { width: 0, height: 0 };
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, []);

  // --- Wheel / trackpad scroll: PANS the view, never zooms. Two-finger
  // trackpad scroll on a laptop and a mouse wheel both surface as wheel
  // events with deltaX/deltaY; we just translate by that delta directly.
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setState((prev) =>
      clampPan({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }, rect.width, rect.height)
    );
  }, []);

  // --- Mouse drag pan ---
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: state.x,
      originY: state.y,
      moved: false,
    };
  }, [state.x, state.y]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const drag = dragRef.current;
      if (!drag.active) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
      if (!drag.moved) return;
      const rect = containerRef.current?.getBoundingClientRect();
      setState((prev) =>
        clampPan(
          { ...prev, x: drag.originX + dx, y: drag.originY + dy },
          rect?.width ?? 0,
          rect?.height ?? 0
        )
      );
    }
    function onUp() {
      dragRef.current.active = false;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  /** True while the most recent mouse gesture was a drag past the click threshold — used to suppress accidental arrow taps mid-pan. */
  const wasDragging = useCallback(() => dragRef.current.moved, []);

  // --- Touch: single-finger drag pans (mirrors "a scroll" on mobile).
  // Multi-finger touch is deliberately NOT handled as pinch-zoom — zoom is
  // buttons-only, so a second touch point is just ignored here.
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (!t) return;
    dragRef.current = {
      active: true,
      startX: t.clientX,
      startY: t.clientY,
      originX: state.x,
      originY: state.y,
      moved: false,
    };
  }, [state.x, state.y]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1 || !dragRef.current.active) return;
    const t = e.touches[0];
    if (!t) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const drag = dragRef.current;
    const dx = t.clientX - drag.startX;
    const dy = t.clientY - drag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
    setState((prev) =>
      clampPan(
        { ...prev, x: drag.originX + dx, y: drag.originY + dy },
        rect?.width ?? 0,
        rect?.height ?? 0
      )
    );
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) dragRef.current.active = false;
  }, []);

  // --- Buttons: the ONLY way scale changes ---
  const zoomIn = useCallback(() => {
    const { width, height } = getContainerSize();
    setState((prev) => clampPan(zoomAround(prev, width / 2, height / 2, prev.scale * BUTTON_ZOOM_STEP), width, height));
  }, [getContainerSize]);

  const zoomOut = useCallback(() => {
    const { width, height } = getContainerSize();
    setState((prev) => clampPan(zoomAround(prev, width / 2, height / 2, prev.scale / BUTTON_ZOOM_STEP), width, height));
  }, [getContainerSize]);

  const resetZoom = useCallback(() => {
    setState({ scale: 1, x: 0, y: 0 });
  }, []);

  return {
    containerRef,
    transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`,
    scale: state.scale,
    isZoomed: state.scale > MIN_ZOOM + 0.001,
    wasDragging,
    handlers: {
      onWheel: handleWheel,
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    zoomIn,
    zoomOut,
    resetZoom,
  };
}