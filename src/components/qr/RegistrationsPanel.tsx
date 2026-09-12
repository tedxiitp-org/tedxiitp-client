"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveRegistration,
  bulkApproveRegistrations,
  getRegistration,
  getRegistrationStats,
  listRegistrations,
  rejectRegistration,
  syncSheet,
  autoSync,
  getSyncState,
  updateRegistration,
  type ApiError,
  type Registration,
  type RegistrationStats,
  type RegistrationStatus,
  type RegistrationTicket,
  type SyncState,
} from "@/lib/qr/api";
import { LoadingRow, SkeletonRows, Spinner } from "./Spinner";

const STATUS_STYLES: Record<RegistrationStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  APPROVED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  REJECTED: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
  DUPLICATE: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  REMOVED: "bg-neutral-700/20 text-neutral-400 border-neutral-600/40",
};

const TIER_LABELS: Record<string, string> = {
  SESSION_1_ONLY: "Session 1",
  SESSION_2_ONLY: "Session 2",
  BOTH_SESSIONS: "Both sessions",
  BOTH_SESSIONS_WITH_TSHIRT: "Both + T-shirt",
  MERCH_ONLY: "T-shirt only",
  UNRECOGNIZED: "Unrecognised",
};

const FLAG_LABELS: Record<string, string> = {
  NO_EMAIL: "No email address",
  NO_TRANSACTION_ID: "No transaction ID",
  UNRECOGNIZED_TICKET_TYPE: "Unrecognised ticket type",
  MERCH_ONLY_NO_ENTRY: "T-shirt only - no session, gets no ticket",
  TRANSACTION_ID_LOOKS_LIKE_AADHAAR: "Transaction ID looks like an Aadhaar number",
  MISSING_TSHIRT_SIZE: "T-shirt tier with no size",
};

export default function RegistrationsPanel() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [status, setStatus] = useState<RegistrationStatus | "">("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMerchOnly, setShowMerchOnly] = useState(false);
  const [loadingRows, setLoadingRows] = useState(true);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [liveSync, setLiveSync] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await listRegistrations({
        status: status || undefined,
        search: search.trim() || undefined,
        tier: showMerchOnly ? "MERCH_ONLY" : undefined,
        page,
        pageSize: 50,
      });
      setRows(response.data);
      setPages(response.pagination.pages ?? 1);
      setTotal(response.pagination.total);
      setError(null);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoadingRows(false);
    }
  }, [status, search, page, showMerchOnly]);

  const loadStats = useCallback(async () => {
    try {
      const response = await getRegistrationStats();
      setStats(response.data);
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const refreshSyncState = useCallback(async () => {
    try {
      const response = await getSyncState();
      setSyncState(response.data);
    } catch {
      setSyncState(null);
    }
  }, []);

  useEffect(() => {
    void refreshSyncState();
  }, [refreshSyncState]);

  useEffect(() => {
    if (!liveSync) return;
    let cancelled = false;

    const tick = async () => {
      try {
        await autoSync();
      } catch {
        return;
      }
      if (cancelled) return;
      await Promise.all([load(), loadStats(), refreshSyncState()]);
    };

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [liveSync, load, loadStats, refreshSyncState]);

  const runSync = async () => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const response = await syncSheet();
      const { rowsRead, registrations, collapsedRows, created, duplicatesMarked } = response.data;
      const parts = [`${registrations} registration${registrations === 1 ? "" : "s"} from ${rowsRead} sheet rows`];
      if (created > 0) parts.push(`${created} new`);
      if (duplicatesMarked > 0) parts.push(`${duplicatesMarked} marked duplicate`);
      if (response.data.removedFromSheet > 0) {
        parts.push(`${response.data.removedFromSheet} no longer in the sheet`);
      }
      if (response.data.restored > 0) parts.push(`${response.data.restored} restored`);
      if (response.data.keptDespiteRemoval > 0) {
        parts.push(`${response.data.keptDespiteRemoval} kept (tickets already sent)`);
      }
      if (collapsedRows > 0) {
        parts.push(
          `${collapsedRows} identical row${collapsedRows === 1 ? "" : "s"} merged (same time, name and transaction)`
        );
      }
      setMessage(parts.join(" · "));
      await Promise.all([load(), loadStats()]);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const approveSelected = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      const response = await bulkApproveRegistrations([...selected]);
      setMessage(`Approved ${response.data.approved} registrations.`);
      setSelected(new Set());
      await Promise.all([load(), loadStats()]);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const decide = async (id: string, next: "APPROVED" | "REJECTED") => {
    setBusy(true);
    setError(null);
    try {
      if (next === "APPROVED") await approveRegistration(id);
      else await rejectRegistration(id);
      await Promise.all([load(), loadStats()]);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allOnPageSelected = useMemo(
    () => rows.length > 0 && rows.every((row) => selected.has(row._id)),
    [rows, selected]
  );

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) rows.forEach((row) => next.delete(row._id));
      else rows.forEach((row) => next.add(row._id));
      return next;
    });
  };

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">Registrations</h2>
          <p className="text-sm text-neutral-400">
            Verify each person, then approve them so they can be included in a ticket batch.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
          <button
            type="button"
            onClick={() => setLiveSync((value) => !value)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition sm:flex-none ${
              liveSync
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-neutral-700 text-neutral-400"
            }`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                liveSync ? "bg-emerald-400" : "bg-neutral-600"
              }`}
            />
            {liveSync ? "Updating automatically" : "Auto-update paused"}
          </button>
          <button
            type="button"
            onClick={runSync}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 sm:flex-none"
          >
            {busy && <Spinner />}
            {busy ? "Working…" : "Sync now"}
          </button>
        </div>
      </div>

      {syncState && (
        <p className="mt-2 break-words text-xs text-neutral-500">
          {syncState.lastSyncedAt
            ? `Last updated ${new Date(syncState.lastSyncedAt).toLocaleTimeString()} (${syncState.triggeredBy.replace(/-/g, " ")}) · ${syncState.lastRowsRead} rows in sheet`
            : "Not synced yet"}
          {syncState.lastError && (
            <span className="ml-2 text-red-400">{syncState.lastError}</span>
          )}
        </p>
      )}

      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Pending" value={stats.byStatus.PENDING ?? 0} />
          <Stat label="Approved" value={stats.byStatus.APPROVED ?? 0} />
          <Stat label="Tickets expected" value={stats.expectedTickets} />
          <Stat label="Emailed" value={`${stats.emailedTickets} / ${stats.issuedTickets}`} />
        </div>
      )}

      {stats && !stats.sheetsConfigured && (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Google Sheets is not connected. Set GOOGLE_SHEETS_ID in the backend environment to sync
          automatically.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(["PENDING", "APPROVED", "REJECTED", "DUPLICATE", "REMOVED", ""] as const).map((value) => (
          <button
            key={value || "ALL"}
            type="button"
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              status === value
                ? "bg-white text-black"
                : "border border-neutral-700 text-neutral-300 hover:border-neutral-500"
            }`}
          >
            {value === "" ? "All" : value.charAt(0) + value.slice(1).toLowerCase()}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setShowMerchOnly((value) => !value);
            setPage(1);
          }}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            showMerchOnly
              ? "bg-white text-black"
              : "border border-neutral-700 text-neutral-300 hover:border-neutral-500"
          }`}
        >
          T-shirt only
        </button>
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search name, email or transaction ID"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-white placeholder:text-neutral-500 focus:border-red-500 focus:outline-none sm:w-auto sm:min-w-[240px] sm:flex-1"
        />
      </div>

      {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {selected.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
          <span className="text-sm text-neutral-300">{selected.size} selected</span>
          <button
            type="button"
            onClick={approveSelected}
            disabled={busy}
            className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Approve selected
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm text-neutral-400 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {loadingRows && (
        <div className="mt-4">
          <SkeletonRows rows={6} />
        </div>
      )}

      <div className={`mt-4 hidden overflow-x-auto ${loadingRows ? "" : "lg:block"}`}>
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="w-8 py-2">
                <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} />
              </th>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Ticket</th>
              <th className="py-2">Transaction</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
                <td className="py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(row._id)}
                    onChange={() => toggle(row._id)}
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => setDetailId(row._id)}
                    className="font-medium text-white hover:text-red-400"
                  >
                    {row.name || "Unnamed"}
                  </button>
                  {row.flags.length > 0 && (
                    <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-300">
                      {row.flags.length}
                    </span>
                  )}
                </td>
                <td className="py-2 text-neutral-300">
                  {row.email ?? <span className="text-amber-400">missing</span>}
                </td>
                <td className="py-2 text-neutral-300">
                  {TIER_LABELS[row.tier] ?? row.tier}
                  <span className="ml-1 text-neutral-500">({row.sessions.length})</span>
                </td>
                <td className="py-2 font-mono text-xs text-neutral-400">
                  {row.transactionId || "—"}
                </td>
                <td className="py-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-2 text-right">
                  {row.status !== "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => decide(row._id, "APPROVED")}
                      disabled={busy}
                      className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {row.status !== "REJECTED" && (
                    <button
                      type="button"
                      onClick={() => decide(row._id, "REJECTED")}
                      disabled={busy}
                      className="ml-2 rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-500">
                  No registrations match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ul className={`mt-4 space-y-3 ${loadingRows ? "hidden" : "lg:hidden"}`}>
        {rows.map((row) => (
          <li
            key={row._id}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-3"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(row._id)}
                onChange={() => toggle(row._id)}
                className="mt-1 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailId(row._id)}
                    className="break-words text-left font-medium text-white hover:text-red-400"
                  >
                    {row.name || "Unnamed"}
                  </button>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[row.status]}`}
                  >
                    {row.status}
                  </span>
                  {row.flags.length > 0 && (
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-300">
                      {row.flags.length} to check
                    </span>
                  )}
                </div>

                <p className="mt-1 break-all text-sm text-neutral-300">
                  {row.email ?? <span className="text-amber-400">email missing</span>}
                </p>

                <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-neutral-500">Ticket</dt>
                    <dd className="text-neutral-300">
                      {TIER_LABELS[row.tier] ?? row.tier}
                      <span className="ml-1 text-neutral-500">({row.sessions.length})</span>
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-neutral-500">Transaction</dt>
                    <dd className="break-all font-mono text-neutral-400">
                      {row.transactionId || "—"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex gap-2">
                  {row.status !== "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => decide(row._id, "APPROVED")}
                      disabled={busy}
                      className="flex-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {row.status !== "REJECTED" && (
                    <button
                      type="button"
                      onClick={() => decide(row._id, "REJECTED")}
                      disabled={busy}
                      className="flex-1 rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="rounded-lg border border-dashed border-neutral-800 px-3 py-8 text-center text-sm text-neutral-500">
            No registrations match this filter.
          </li>
        )}
      </ul>

      <div className="mt-3 flex flex-col gap-3 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {total} registration{total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            className="rounded-md border border-neutral-700 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((value) => value + 1)}
            className="rounded-md border border-neutral-700 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {detailId && (
        <RegistrationDetail
          id={detailId}
          onClose={() => setDetailId(null)}
          onChanged={() => {
            void load();
            void loadStats();
          }}
        />
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="text-xl font-semibold text-white tabular-nums">{value}</p>
    </div>
  );
}

function RegistrationDetail({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [tickets, setTickets] = useState<RegistrationTicket[]>([]);
  const [emailDraft, setEmailDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await getRegistration(id);
      setRegistration(response.data.registration);
      setTickets(response.data.tickets);
      setEmailDraft(response.data.registration.email ?? "");
    } catch (err) {
      setError((err as ApiError).message);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveEmail = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateRegistration(id, { email: emailDraft.trim() });
      await load();
      onChanged();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const decide = async (next: "APPROVED" | "REJECTED") => {
    setBusy(true);
    setError(null);
    try {
      if (next === "APPROVED") await approveRegistration(id);
      else await rejectRegistration(id);
      await load();
      onChanged();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="my-4 w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:my-8 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        {!registration ? (
          <p className="text-neutral-400">Loading…</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="break-words text-lg font-semibold text-white sm:text-xl">
                  {registration.name}
                </h3>
                <p className="text-sm text-neutral-400">
                  Submitted{" "}
                  {registration.submittedAt
                    ? new Date(registration.submittedAt).toLocaleString()
                    : "unknown"}{" "}
                  · sheet row {registration.sourceRow}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {registration.flags.length > 0 && (
              <ul className="mt-4 space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                {registration.flags.map((flag) => (
                  <li key={flag} className="text-sm text-amber-300">
                    {FLAG_LABELS[flag] ?? flag}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Ticket type" value={registration.ticketTypeRaw || "—"} />
              <Field
                label="Sessions"
                value={registration.sessions.join(", ") || "none — cannot be ticketed"}
              />
              <Field label="T-shirt size" value={registration.tshirtSize ?? "—"} />
              <Field label="Transaction ID" value={registration.transactionId || "—"} mono />
              <Field label="Roll number" value={registration.rollNo ?? "—"} />
              <Field label="Institute ID" value={registration.instituteId ?? "—"} />
              <Field
                label="Resides at IIT Patna"
                value={
                  registration.residesAtIITP === null
                    ? "—"
                    : registration.residesAtIITP
                      ? "Yes"
                      : "No"
                }
              />
              <Field label="Aadhaar number" value={registration.aadhaarNumber ?? "—"} mono />
              <Field label="Address" value={registration.address ?? "—"} />
              <Field label="Comments" value={registration.comments ?? "—"} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {registration.paymentProofUrl && (
                <a
                  href={registration.paymentProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:border-red-500"
                >
                  Open payment screenshot
                </a>
              )}
              {registration.aadhaarUrl && (
                <a
                  href={registration.aadhaarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:border-red-500"
                >
                  Open Aadhaar upload
                </a>
              )}
            </div>

            <div className="mt-5">
              <label className="block text-xs uppercase tracking-wide text-neutral-500">
                Email address ({registration.emailSource.toLowerCase().replace(/_/g, " ")})
              </label>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                <input
                  value={emailDraft}
                  onChange={(event) => setEmailDraft(event.target.value)}
                  placeholder="Add the address their ticket should go to"
                  className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={saveEmail}
                  disabled={busy || !emailDraft.trim()}
                  className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:border-emerald-500 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>

            {tickets.length > 0 && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Tickets issued</p>
                <ul className="mt-2 space-y-2">
                  {tickets.map((ticket) => (
                    <li
                      key={ticket.ticketId}
                      className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
                    >
                      <span className="font-mono text-neutral-200">{ticket.ticketId}</span>
                      <span className="ml-2 text-neutral-400">{ticket.session}</span>
                      <span className="ml-2 text-neutral-400">
                        {ticket.emailedAt
                          ? `emailed ${new Date(ticket.emailedAt).toLocaleString()}`
                          : "not emailed"}
                      </span>
                      {ticket.isCheckedIn && (
                        <span className="ml-2 text-emerald-400">checked in</span>
                      )}
                      {ticket.lastEmailError && (
                        <p className="mt-1 text-xs text-red-400">{ticket.lastEmailError}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => decide("REJECTED")}
                disabled={busy}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => decide("APPROVED")}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`break-words text-sm text-neutral-200 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
