"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "./api";

const ROLE_KEY = "tedx_role";
const EMAIL_KEY = "tedx_email";

export function saveSession(role: Role, email: string) {
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearSession() {
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(ROLE_KEY) as Role | null) ?? null;
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

/**
 * Client-side guard. The HttpOnly cookie is the real source of truth on the
 * backend; this only controls which UI a user sees. `allow` restricts a page to
 * specific roles.
 */
export function useRequireAuth(allow?: Role[]) {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const r = getRole();
    if (!r) {
      router.replace("/login");
      return;
    }
    if (allow && !allow.includes(r)) {
      // Wrong role for this page -> send them to their home.
      router.replace(r === "ADMIN" ? "/admin" : "/scan");
      return;
    }
    setRole(r);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { role, ready };
}
