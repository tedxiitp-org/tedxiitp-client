"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import RegistrationsPanel from "@/components/qr/RegistrationsPanel";
import BatchPanel from "@/components/qr/BatchPanel";
import VolunteersPanel from "@/components/qr/VolunteersPanel";
import { useRequireAuth } from "@/lib/auth";
import {
  generateTicket,
  getAttendance,
  getAttendees,
  revokeTicket,
  getVolunteerScanStats,
  revokeTicketsBulk,
  type ApiError,
  type Session,
  type VolunteerScanStat,
  type BulkRevokeResult,
  type Attendee,
  type AttendeeSummary,
  exportAttendeesCsv,
} from "@/lib/api";

export default function AdminPage() {
  const { ready } = useRequireAuth(["ADMIN"]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header title="Admin Dashboard" />
      <div className="mx-auto w-full max-w-5xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-6 sm:py-8 xl:max-w-7xl">
        <AttendancePanel />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <GeneratePanel />
          <RevokePanel />
        </div>
        <RegistrationsPanel />
        <BatchPanel />
        <AttendeeListPanel />
        <VolunteersPanel />
        <ScanReportPanel />
      </div>
    </main>
  );
}

function AttendancePanel() {
  const [stats, setStats] = useState<Record<Session, number>>({
    SESSION_1: 0,
    SESSION_2: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAttendance();
      const next: Record<Session, number> = { SESSION_1: 0, SESSION_2: 0 };
      for (const row of res.data) next[row._id] = row.count;
      setStats(next);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Attendance</h2>
        <button
          onClick={load}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm transition hover:bg-neutral-800"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Session 1 — Checked in" value={stats.SESSION_1} />
        <StatCard label="Session 2 — Checked in" value={stats.SESSION_2} />
        <StatCard
          label="Total Checked in"
          value={stats.SESSION_1 + stats.SESSION_2}
          accent
        />
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <p
        className="text-3xl font-bold"
        style={accent ? { color: "var(--tedx-red)" } : undefined}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-neutral-400">{label}</p>
    </div>
  );
}

function GeneratePanel() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [session, setSession] = useState<Session>("SESSION_1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    ticketId: string;
    qrCode: string;
    emailSent?: boolean;
    emailError?: string;
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await generateTicket(email.trim(), session, transactionId.trim(), name.trim() || undefined);
      setResult({
        ticketId: res.data.ticketId,
        qrCode: res.data.qrCode,
        emailSent: res.data.emailSent,
        emailError: res.data.emailError,
      });
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h2 className="mb-4 text-lg font-semibold">Generate Ticket</h2>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            Attendee Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="attendee@email.com"
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
          <p className="mt-1 text-xs text-neutral-600">
            One ticket per email per session. The QR is emailed automatically.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            Attendee Name <span className="text-neutral-600">(optional)</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Used to personalise the email"
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            Transaction ID
          </label>
          <input
            required
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g. TXN123456"
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Session</label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value as Session)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500"
          >
            <option value="SESSION_1">Session 1</option>
            <option value="SESSION_2">Session 2</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ backgroundColor: "var(--tedx-red)" }}
        >
          {loading ? "Generating…" : "Generate QR Ticket"}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-center">
          <p className="text-sm text-neutral-400">Ticket ID</p>
          <p className="mb-3 font-mono text-sm font-semibold">
            {result.ticketId}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.qrCode}
            alt={`QR code for ${result.ticketId}`}
            className="mx-auto h-48 w-48 rounded bg-white p-2"
          />
          <a
            href={result.qrCode}
            download={`${result.ticketId}.png`}
            className="mt-4 inline-block rounded-md border border-neutral-700 px-4 py-2 text-sm transition hover:bg-neutral-800"
          >
            Download QR
          </a>
          <p
            className={`mt-3 text-xs ${
              result.emailSent ? "text-green-400" : "text-amber-400"
            }`}
          >
            {result.emailSent
              ? "✓ Ticket emailed to attendee"
              : `Email not sent${
                  result.emailError ? ` — ${result.emailError}` : ""
                }`}
          </p>
        </div>
      )}
    </section>
  );
}

function RevokePanel() {
  const [mode, setMode] = useState<"ticketId" | "email">("ticketId");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const trimmed = value.trim();
      const identifier =
        mode === "email" ? { email: trimmed } : { ticketId: trimmed };
      const res = await revokeTicket(identifier);
      setMsg({ ok: true, text: res.message || "Ticket revoked." });
      setValue("");
    } catch (err) {
      setMsg({ ok: false, text: (err as ApiError).message });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: "ticketId" | "email") => {
    setMode(m);
    setValue("");
    setMsg(null);
  };

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h2 className="mb-4 text-lg font-semibold">Revoke Ticket</h2>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => switchMode("ticketId")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm transition ${
            mode === "ticketId"
              ? "bg-neutral-800 text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          By Ticket ID
        </button>
        <button
          type="button"
          onClick={() => switchMode("email")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm transition ${
            mode === "email"
              ? "bg-neutral-800 text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          By Email
        </button>
      </div>

      <form onSubmit={handleRevoke} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            {mode === "email" ? "Attendee Email" : "Ticket ID"}
          </label>
          <input
            required
            type={mode === "email" ? "email" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              mode === "email" ? "attendee@email.com" : "TEDXIITP-26-81-0001"
            }
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm outline-none focus:border-red-500"
          />
        </div>

        {msg && (
          <p
            className={`text-sm ${msg.ok ? "text-green-400" : "text-red-400"}`}
          >
            {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md border border-red-900 bg-red-950/40 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-950/70 disabled:opacity-50"
        >
          {loading ? "Revoking…" : "Revoke Ticket"}
        </button>
      </form>
      <p className="mt-3 text-xs text-neutral-600">
        A revoked ticket can no longer be checked in at the gate. Revoking by
        email revokes all of that attendee&apos;s tickets.
      </p>
    </section>
  );
}

function AttendeeListPanel() {
  const [session, setSession] = useState<Session>("SESSION_1");
  const [rows, setRows] = useState<Attendee[]>([]);
  const [summary, setSummary] = useState<AttendeeSummary>({
    total: 0,
    attending: 0,
    absent: 0,
  });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (s: Session) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAttendees(s);
      setRows(res.data);
      setSummary(res.summary);
    } catch (err) {
      setError((err as ApiError).message);
      setRows([]);
      setSummary({ total: 0, attending: 0, absent: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportAttendeesCsv(session);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendees_${session}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as ApiError).message);
    }
  };

  // Reload whenever the selected session changes.
  useEffect(() => {
    load(session);
  }, [session]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (r) =>
          (r.email || "").toLowerCase().includes(q) ||
          (r.name || "").toLowerCase().includes(q)
      )
    : rows;

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Attendee List</h2>
        <div className="flex items-center gap-2">
          {/* Session switcher */}
          <div className="inline-flex rounded-md border border-neutral-700 p-0.5">
            {(["SESSION_1", "SESSION_2"] as Session[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSession(s)}
                className={`rounded px-3 py-1.5 text-sm transition ${
                  session === s
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {s === "SESSION_1" ? "Session 1" : "Session 2"}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(session)}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm transition hover:bg-neutral-800"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={handleExport}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm transition hover:bg-neutral-800"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <StatCard label="Total Tickets" value={summary.total} />
        <StatCard label="Attending" value={summary.attending} accent />
        <StatCard label="Absent" value={summary.absent} />
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email…"
        className="mb-4 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500"
      />

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <div className="max-h-96 overflow-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-neutral-950">
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Transaction ID</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-neutral-500">
                  {rows.length === 0
                    ? "No tickets generated for this session yet."
                    : "No attendees match your search."}
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.ticketId} className="border-b border-neutral-900">
                <td className="px-3 py-2">{r.name || "—"}</td>
                <td className="px-3 py-2 text-neutral-400">{r.email}</td>
                <td className="px-3 py-2 font-mono text-xs text-neutral-400">{r.transactionId}</td>
                <td className="px-3 py-2">
                  <AttendanceBadge attendee={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-neutral-600">
        &ldquo;Attending&rdquo; means the ticket was scanned at the gate for this
        session. Revoked tickets cannot be checked in.
      </p>
    </section>
  );
}

function AttendanceBadge({ attendee }: { attendee: Attendee }) {
  // A revoked ticket can never attend, so flag it explicitly.
  if (attendee.ticketStatus === "REVOKED") {
    return (
      <span className="rounded-full bg-red-950/50 px-2.5 py-0.5 text-xs font-medium text-red-300">
        Revoked
      </span>
    );
  }
  if (attendee.isCheckedIn) {
    return (
      <span className="rounded-full bg-green-950/50 px-2.5 py-0.5 text-xs font-medium text-green-300">
        Attending
      </span>
    );
  }
  return (
    <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-400">
      Absent
    </span>
  );
}

function ScanReportPanel() {
  const [rows, setRows] = useState<VolunteerScanStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVolunteerScanStats();
      setRows(res.data);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Volunteer Scan Report</h2>
        <button
          onClick={load}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm transition hover:bg-neutral-800"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="py-2 pr-4 font-medium">Volunteer</th>
              <th className="py-2 pr-4 text-right font-medium">Valid</th>
              <th className="py-2 pr-4 text-right font-medium">Duplicate</th>
              <th className="py-2 pr-4 text-right font-medium">Revoked</th>
              <th className="py-2 pr-4 text-right font-medium">Invalid</th>
              <th className="py-2 pr-4 text-right font-medium">Wrong Sess.</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-neutral-500">
                  No scans recorded yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.scannedById} className="border-b border-neutral-900">
                <td className="py-2 pr-4">
                  {r.email}
                  {r.role && (
                    <span className="ml-2 text-xs text-neutral-600">
                      {r.role}
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4 text-right text-green-400">
                  {r.success}
                </td>
                <td className="py-2 pr-4 text-right text-neutral-400">
                  {r.duplicate}
                </td>
                <td className="py-2 pr-4 text-right text-neutral-400">
                  {r.revoked}
                </td>
                <td className="py-2 pr-4 text-right text-neutral-400">
                  {r.invalid}
                </td>
                <td className="py-2 pr-4 text-right text-neutral-400">
                  {r.wrongSession}
                </td>
                <td className="py-2 text-right font-semibold">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-neutral-600">
        &ldquo;Valid&rdquo; counts successful check-ins. Other columns are failed
        scan attempts handled by that volunteer.
      </p>
    </section>
  );
}
