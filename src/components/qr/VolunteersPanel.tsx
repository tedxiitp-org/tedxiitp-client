"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createVolunteer,
  deleteVolunteer,
  listVolunteers,
  updateVolunteer,
  type ApiError,
  type Session,
  type Volunteer,
} from "@/lib/qr/api";
import { SkeletonRows, Spinner } from "./Spinner";

const SESSION_LABELS: Record<Session, string> = {
  SESSION_1: "Session 1",
  SESSION_2: "Session 2",
};

export default function VolunteersPanel() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await listVolunteers();
      setVolunteers(response.data);
      setError(null);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleSession = (session: Session) => {
    setSessions((prev) =>
      prev.includes(session) ? prev.filter((value) => value !== session) : [...prev, session]
    );
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await createVolunteer({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        allowedSessions: sessions,
      });
      setMessage(`Added ${email.trim()}.`);
      setEmail("");
      setName("");
      setPassword("");
      setSessions([]);
      await load();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const patch = async (
    id: string,
    changes: { isActive?: boolean; allowedSessions?: Session[] }
  ) => {
    setBusy(true);
    setError(null);
    try {
      await updateVolunteer(id, changes);
      await load();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string, label: string) => {
    if (!window.confirm(`Remove ${label}? They will not be able to scan again.`)) return;
    setBusy(true);
    try {
      await deleteVolunteer(id);
      await load();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const toggleGrant = (volunteer: Volunteer, session: Session) => {
    const current = volunteer.allowedSessions ?? [];
    const next = current.includes(session)
      ? current.filter((value) => value !== session)
      : [...current, session];
    void patch(volunteer._id, { allowedSessions: next });
  };

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-white">Volunteers</h2>
      <p className="text-sm text-neutral-400">
        Volunteers scan at the gate. Grant no sessions to allow both, or pick the gates they cover.
      </p>

      <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-red-500 focus:outline-none"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-red-500 focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password (min 8 characters)"
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-red-500 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(SESSION_LABELS) as Session[]).map((session) => (
            <button
              key={session}
              type="button"
              onClick={() => toggleSession(session)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                sessions.includes(session)
                  ? "bg-white text-black"
                  : "border border-neutral-700 text-neutral-300 hover:border-neutral-500"
              }`}
            >
              {SESSION_LABELS[session]}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 sm:col-span-2"
        >
          {busy && <Spinner />}
          Add volunteer
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {loading && (
        <div className="mt-5">
          <SkeletonRows rows={3} />
        </div>
      )}

      <ul className={loading ? "hidden" : "mt-5 space-y-2"}>
        {volunteers.map((volunteer) => (
          <li
            key={volunteer._id}
            className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          >
            <div className="min-w-0 sm:min-w-[180px]">
              <p className="text-sm font-medium text-white">
                {volunteer.name || volunteer.email}
              </p>
              <p className="break-all text-xs text-neutral-500">
                {volunteer.email}
                {volunteer.lastLoginAt
                  ? ` · last signed in ${new Date(volunteer.lastLoginAt).toLocaleString()}`
                  : " · never signed in"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(SESSION_LABELS) as Session[]).map((session) => {
                const granted =
                  (volunteer.allowedSessions ?? []).length === 0 ||
                  (volunteer.allowedSessions ?? []).includes(session);
                return (
                  <button
                    key={session}
                    type="button"
                    onClick={() => toggleGrant(volunteer, session)}
                    disabled={busy}
                    className={`rounded-full px-2.5 py-1 text-xs transition disabled:opacity-50 ${
                      granted
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "border border-neutral-700 text-neutral-500"
                    }`}
                  >
                    {SESSION_LABELS[session]}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => patch(volunteer._id, { isActive: !volunteer.isActive })}
                disabled={busy}
                className={`rounded-md px-3 py-1 text-xs transition disabled:opacity-50 ${
                  volunteer.isActive
                    ? "border border-neutral-700 text-neutral-300 hover:border-amber-500 hover:text-amber-400"
                    : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                }`}
              >
                {volunteer.isActive ? "Deactivate" : "Reactivate"}
              </button>
              <button
                type="button"
                onClick={() => remove(volunteer._id, volunteer.email)}
                disabled={busy}
                className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {volunteers.length === 0 && (
          <li className="rounded-lg border border-dashed border-neutral-800 px-3 py-6 text-center text-sm text-neutral-500">
            No volunteers yet.
          </li>
        )}
      </ul>
    </section>
  );
}
