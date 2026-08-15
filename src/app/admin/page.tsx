"use client";

import { useEffect, useState } from "react";
import Header from "@/src/components/qr/Header";
import { useRequireAuth } from "@/src/lib/qr/auth";
import {
  generateTicket,
  getAttendance,
  getAttendees,
  revokeTicket,
  listVolunteers,
  createVolunteer,
  deleteVolunteer,
  getVolunteerScanStats,
  generateTicketsBulk,
  revokeTicketsBulk,
  type ApiError,
  type Session,
  type Volunteer,
  type VolunteerScanStat,
  type BulkGenerateResult,
  type BulkRevokeResult,
  type Attendee,
  type AttendeeSummary,
  exportAttendeesCsv,
} from "@/src/lib/qr/api";
import { parseAttendeeCsv, type ParsedAttendee } from "@/src/lib/qr/csv";

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
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <AttendancePanel />
        <div className="grid gap-6 md:grid-cols-2">
          <GeneratePanel />
          <RevokePanel />
        </div>
        <BulkPanel />
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

type BulkRowStatus =
  | "pending"
  | "working"
  | "generated"
  | "duplicate"
  | "revoked"
  | "not_found"
  | "error";

interface BulkRow extends ParsedAttendee {
  status: BulkRowStatus;
  ticketId?: string;
  emailSent?: boolean;
  message?: string;
}

const STATUS_STYLES: Record<BulkRowStatus, string> = {
  pending: "text-neutral-500",
  working: "text-blue-400",
  generated: "text-green-400",
  duplicate: "text-amber-400",
  revoked: "text-green-400",
  not_found: "text-amber-400",
  error: "text-red-400",
};

function BulkPanel() {
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [session, setSession] = useState<Session>("SESSION_1");
  const [busy, setBusy] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-uploading the same file name
    if (!file) return;
    setParseError(null);
    setSummary(null);
    try {
      const text = await file.text();
      const parsed = parseAttendeeCsv(text);
      if (parsed.length === 0) {
        setParseError(
          "No valid rows found. Expected 'email' and 'transaction id' columns."
        );
        setRows([]);
        setFileName(file.name);
        return;
      }
      setRows(parsed.map((p) => ({ ...p, status: "pending" as const })));
      setFileName(file.name);
    } catch {
      setParseError("Could not read that file.");
    }
  };

  const patchRow = (email: string, patch: Partial<BulkRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.email === email ? { ...r, ...patch } : r))
    );
  };

  const applyGenerateResults = (results: BulkGenerateResult[]) => {
    const byEmail = new Map(results.map((r) => [r.email.toLowerCase(), r]));
    setRows((prev) =>
      prev.map((r) => {
        const res = byEmail.get(r.email.toLowerCase());
        if (!res) return r;
        return {
          ...r,
          status: res.status,
          ticketId: res.ticketId,
          emailSent: res.emailSent,
          message: res.message,
        };
      })
    );
  };

  const applyRevokeResults = (results: BulkRevokeResult[]) => {
    const byEmail = new Map(results.map((r) => [r.email.toLowerCase(), r]));
    setRows((prev) =>
      prev.map((r) => {
        const res = byEmail.get(r.email.toLowerCase());
        if (!res) return r;
        return { ...r, status: res.status, message: res.message };
      })
    );
  };

  const generateAll = async () => {
    if (rows.length === 0 || busy) return;
    setBusy(true);
    setSummary(null);
    setRows((prev) => prev.map((r) => ({ ...r, status: "working" as const })));
    try {
      const res = await generateTicketsBulk(
        rows.map((r) => ({ email: r.email, transactionId: r.transactionId, name: r.name })),
        session
      );
      applyGenerateResults(res.data);
      setSummary(res.message);
    } catch (err) {
      setSummary((err as ApiError).message);
      setRows((prev) =>
        prev.map((r) =>
          r.status === "working" ? { ...r, status: "pending" } : r
        )
      );
    } finally {
      setBusy(false);
    }
  };

  const revokeAll = async () => {
    if (rows.length === 0 || busy) return;
    if (!window.confirm(`Revoke tickets for all ${rows.length} attendees?`))
      return;
    setBusy(true);
    setSummary(null);
    setRows((prev) => prev.map((r) => ({ ...r, status: "working" as const })));
    try {
      const res = await revokeTicketsBulk(rows.map((r) => r.email));
      applyRevokeResults(res.data);
      setSummary(res.message);
    } catch (err) {
      setSummary((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const generateOne = async (row: BulkRow) => {
    if (busy) return;
    patchRow(row.email, { status: "working" });
    try {
      const res = await generateTicket(row.email, session, row.transactionId, row.name);
      patchRow(row.email, {
        status: "generated",
        ticketId: res.data.ticketId,
        emailSent: res.data.emailSent,
        message: res.data.emailError,
      });
    } catch (err) {
      const e = err as ApiError;
      patchRow(row.email, {
        status: e.status === 409 ? "duplicate" : "error",
        message: e.message,
      });
    }
  };

  const revokeOne = async (row: BulkRow) => {
    if (busy) return;
    patchRow(row.email, { status: "working" });
    try {
      await revokeTicket({ email: row.email });
      patchRow(row.email, { status: "revoked", message: undefined });
    } catch (err) {
      const e = err as ApiError;
      patchRow(row.email, {
        status: e.status === 404 ? "not_found" : "error",
        message: e.message,
      });
    }
  };

  const clearAll = () => {
    setRows([]);
    setFileName(null);
    setParseError(null);
    setSummary(null);
  };

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Bulk Tickets (CSV)</h2>
        {rows.length > 0 && (
          <button
            onClick={clearAll}
            disabled={busy}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm transition hover:bg-neutral-800 disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            Upload CSV
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="block w-full text-sm text-neutral-400 file:mr-3 file:rounded-md file:border file:border-neutral-700 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-sm file:text-neutral-200 hover:file:bg-neutral-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            Session for batch
          </label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value as Session)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500"
          >
            <option value="SESSION_1">Session 1</option>
            <option value="SESSION_2">Session 2</option>
          </select>
        </div>
      </div>
      <p className="mt-2 text-xs text-neutral-600">
        CSV needs an <span className="font-mono">email</span> and <span className="font-mono">transaction id</span> column; an optional{" "}
        <span className="font-mono">name</span> column personalises the email.
        Tickets are emailed automatically on generate.
      </p>

      {parseError && <p className="mt-3 text-sm text-red-400">{parseError}</p>}

      {rows.length > 0 && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={generateAll}
              disabled={busy}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: "var(--tedx-red)" }}
            >
              {busy ? "Working…" : `Generate All (${rows.length})`}
            </button>
            <button
              onClick={revokeAll}
              disabled={busy}
              className="rounded-md border border-red-900 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-950/70 disabled:opacity-50"
            >
              Revoke All
            </button>
            {fileName && (
              <span className="text-xs text-neutral-500">{fileName}</span>
            )}
          </div>

          {summary && (
            <p className="mt-3 text-sm text-neutral-300">{summary}</p>
          )}

          <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-neutral-950">
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Transaction ID</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.email} className="border-b border-neutral-900">
                    <td className="px-3 py-2">{r.email}</td>
                    <td className="px-3 py-2 text-neutral-400">
                      {r.name || "—"}
                    </td>
                    <td className="px-3 py-2 text-neutral-400">
                      {r.transactionId || "—"}
                    </td>
                    <td className={`px-3 py-2 ${STATUS_STYLES[r.status]}`}>
                      {r.status === "working" ? "…" : r.status}
                      {r.status === "generated" && r.emailSent === false && (
                        <span className="ml-1 text-amber-400">(no email)</span>
                      )}
                      {r.message && (
                        <span
                          className="ml-1 text-neutral-600"
                          title={r.message}
                        >
                          ⓘ
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => generateOne(r)}
                          disabled={busy || r.status === "working"}
                          className="rounded-md border border-neutral-700 px-2 py-1 text-xs transition hover:bg-neutral-800 disabled:opacity-50"
                        >
                          Generate
                        </button>
                        <button
                          onClick={() => revokeOne(r)}
                          disabled={busy || r.status === "working"}
                          className="rounded-md border border-red-900 px-2 py-1 text-xs text-red-300 transition hover:bg-red-950/50 disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
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

function VolunteersPanel() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [formMsg, setFormMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listVolunteers();
      setVolunteers(res.data);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    setCreating(true);
    try {
      await createVolunteer(email.trim(), password);
      setFormMsg({ ok: true, text: "Volunteer created." });
      setEmail("");
      setPassword("");
      await load();
    } catch (err) {
      setFormMsg({ ok: false, text: (err as ApiError).message });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (v: Volunteer) => {
    if (!window.confirm(`Remove volunteer ${v.email}?`)) return;
    setDeletingId(v._id);
    try {
      await deleteVolunteer(v._id);
      await load();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Volunteers</h2>
        <button
          onClick={load}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm transition hover:bg-neutral-800"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <form
        onSubmit={handleCreate}
        className="mb-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="volunteer@email.com"
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-md py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ backgroundColor: "var(--tedx-red)" }}
        >
          {creating ? "Adding…" : "Add Volunteer"}
        </button>
      </form>

      {formMsg && (
        <p
          className={`mb-3 text-sm ${
            formMsg.ok ? "text-green-400" : "text-red-400"
          }`}
        >
          {formMsg.text}
        </p>
      )}
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Added</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {volunteers.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-neutral-500">
                  No volunteers yet.
                </td>
              </tr>
            )}
            {volunteers.map((v) => (
              <tr key={v._id} className="border-b border-neutral-900">
                <td className="py-2 pr-4">{v.email}</td>
                <td className="py-2 pr-4 text-neutral-500">
                  {v.createdAt
                    ? new Date(v.createdAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => handleDelete(v)}
                    disabled={deletingId === v._id}
                    className="rounded-md border border-red-900 px-3 py-1 text-xs text-red-300 transition hover:bg-red-950/50 disabled:opacity-50"
                  >
                    {deletingId === v._id ? "Removing…" : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
