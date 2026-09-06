"use client";

import { X, Volume2, VolumeX, Music, Coins } from "lucide-react";

interface SettingsPanelProps {
  soundEnabled: boolean;
  musicEnabled: boolean;
  coins: number;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onClose: () => void;
}

function ToggleRow({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 text-white">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={value}
        className={[
          "w-12 h-7 rounded-full flex items-center px-1 transition-colors",
          value ? "bg-emerald-400 justify-end" : "bg-white/15 justify-start",
        ].join(" ")}
      >
        <span className="w-5 h-5 rounded-full bg-white block" />
      </button>
    </div>
  );
}

export default function SettingsPanel({
  soundEnabled,
  musicEnabled,
  coins,
  onToggleSound,
  onToggleMusic,
  onClose,
}: SettingsPanelProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-[min(90vw,340px)] rounded-3xl bg-[#1c1d30] border border-white/10 shadow-2xl p-5 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20 px-3 py-2 mb-2 text-yellow-300 text-sm font-semibold">
          <Coins size={16} />
          {coins} coins
        </div>

        <div className="divide-y divide-white/10">
          <ToggleRow
            icon={soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            label="Sound Effects"
            value={soundEnabled}
            onToggle={onToggleSound}
          />
          <ToggleRow
            icon={<Music size={18} />}
            label="Music"
            value={musicEnabled}
            onToggle={onToggleMusic}
          />
        </div>
      </div>
    </div>
  );
}
