"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

/**
 * Wraps html5-qrcode. Calls onScan with the decoded text. After a successful
 * scan it stops the camera; the parent re-mounts (via `key`) to scan again.
 */
export default function QrScanner({
  onScan,
  onError,
}: {
  onScan: (text: string) => void;
  onError?: (message: string) => void;
}) {
  const containerId = "qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);

  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number } | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;
    let active = true;
    let startPromise: Promise<unknown> | null = null;

    // Defer start() to a macrotask. Under React StrictMode the effect mounts,
    // unmounts, then remounts synchronously; clearing this timer in the first
    // (throwaway) cleanup means the camera only ever starts on the surviving
    // mount. Otherwise the first mount's video.play() is interrupted when the
    // element is torn down -> "play() request was interrupted" AbortError.
    const startTimer = setTimeout(() => {
      startPromise = scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (handledRef.current) return;
            handledRef.current = true;
            onScan(decodedText);
          },
          () => {
            /* per-frame decode failures are normal; ignore */
          }
        )
        .then(() => {
          if (!active) return;
          try {
            const capabilities = scanner.getRunningTrackCameraCapabilities();
            if (capabilities && capabilities.zoomFeature && capabilities.zoomFeature().isSupported()) {
              const zoomFeature = capabilities.zoomFeature();
              setZoomRange({
                min: zoomFeature.min(),
                max: zoomFeature.max(),
                step: zoomFeature.step() || 0.1,
              });
              setZoom(zoomFeature.value() || zoomFeature.min());
            } else {
              // Fallback for older browsers via standard track capabilities
              const trackCapabilities = scanner.getRunningTrackCapabilities() as any;
              if (trackCapabilities && trackCapabilities.zoom) {
                setZoomRange({
                  min: trackCapabilities.zoom.min,
                  max: trackCapabilities.zoom.max,
                  step: trackCapabilities.zoom.step || 0.1,
                });
                const settings = scanner.getRunningTrackSettings() as any;
                setZoom(settings.zoom || trackCapabilities.zoom.min);
              }
            }
          } catch (e) {
            console.warn("Zoom feature not supported or accessible", e);
          }
        })
        .catch((err) => {
          if (active) onError?.(err?.message || "Unable to start camera.");
        });
    }, 0);

    return () => {
      active = false;
      clearTimeout(startTimer);
      // If start() never fired (transient StrictMode mount), there is nothing
      // to stop. Otherwise wait for it to settle, then stop only if scanning.
      if (!startPromise) return;
      startPromise
        .then(() => {
          if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
            return scanner.stop();
          }
        })
        .then(() => scanner.clear())
        .catch(() => {
          /* already stopped or never started */
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setZoom(value);

    if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      try {
        const capabilities = scannerRef.current.getRunningTrackCameraCapabilities();
        if (capabilities && capabilities.zoomFeature && capabilities.zoomFeature().isSupported()) {
          capabilities.zoomFeature().apply(value).catch(console.warn);
        } else {
          // Fallback
          scannerRef.current.applyVideoConstraints({
            advanced: [{ zoom: value } as any],
          }).catch(console.warn);
        }
      } catch (err) {
        console.warn("Failed to set zoom", err);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <div
        id={containerId}
        className="overflow-hidden rounded-lg border border-neutral-800"
      />
      
      {zoomRange && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
          <label className="mb-2 flex items-center justify-between text-xs text-neutral-400">
            <span>Zoom</span>
            <span>{zoom.toFixed(1)}x</span>
          </label>
          <input
            type="range"
            min={zoomRange.min}
            max={zoomRange.max}
            step={zoomRange.step}
            value={zoom}
            onChange={handleZoomChange}
            className="w-full accent-red-600"
          />
        </div>
      )}
    </div>
  );
}
