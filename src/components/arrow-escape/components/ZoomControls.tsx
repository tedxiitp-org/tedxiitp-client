"use client";

import { Plus, Minus, Maximize2 } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  isZoomed: boolean;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onReset, isZoomed }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10">
      <button
        onClick={onZoomIn}
        aria-label="Zoom in"
        className="w-9 h-9 rounded-xl bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        <Plus size={16} />
      </button>
      <button
        onClick={onZoomOut}
        aria-label="Zoom out"
        className="w-9 h-9 rounded-xl bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        <Minus size={16} />
      </button>
      {isZoomed && (
        <button
          onClick={onReset}
          aria-label="Reset zoom"
          className="w-9 h-9 rounded-xl bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <Maximize2 size={14} />
        </button>
      )}
    </div>
  );
}
