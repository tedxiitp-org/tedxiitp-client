"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { clearSession, getEmail, getRole } from "@/lib/auth";

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  const email = getEmail();
  const role = getRole();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /* ignore network errors on logout */
    }
    clearSession();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold tracking-tight">
          <span style={{ color: "var(--tedx-red)" }}>TEDx</span>IITPatna
        </span>
        <span className="hidden text-sm text-neutral-400 sm:inline">/ {title}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-neutral-300">{email}</p>
          <p className="text-xs text-neutral-500">{role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 transition hover:bg-neutral-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
