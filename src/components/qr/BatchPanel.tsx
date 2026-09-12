"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelBatch,
  createBatch,
  getBatch,
  listBatches,
  previewBatch,
  pumpBatch,
  retryBatchFailures,
  type ApiError,
  type BatchPreview,
  type BatchRecipient,
  type Job,
  type JobItem,
  type JobItemStatus,
} from "@/lib/qr/api";
import { LoadingRow, SkeletonRows, Spinner } from "./Spinner";

const ITEM_STATUS_STYLES: Record<JobItemStatus, string> = {
  PENDING: "text-neutral-400",
  PROCESSING: "text-sky-300",
  SENT: "text-emerald-400",
  ALREADY_ISSUED: "text-sky-400",
  FAILED: "text-red-400",
  SKIPPED: "text-amber-400",
};

const PUMP_BUDGET_MS = 8000;
const PUMP_CONCURRENCY = 4;
const MAX_CONSECUTIVE_ERRORS = 6;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function BatchPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [items, setItems] = useState<JobItem[]>([]);
  const [itemFilter, setItemFilter] = useState<JobItemStatus | "">("");
  const [preview, setPreview] = useState<BatchPreview | null>(null);
  const [label, setLabel] = useState("Ticket batch");
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [retrying, setRetrying] = useState(0);
  const [showRecipients, setShowRecipients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const stopRequested = useRef(false);

  const refreshPreview = useCallback(async () => {
    try {
      const response = await previewBatch();
      setPreview(response.data);
    } catch {
      setPreview(null);
    }
  }, []);

  const refreshJobs = useCallback(async () => {
    try {
      const response = await listBatches();
      setJobs(response.data);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const refreshActive = useCallback(
    async (jobId: string, status?: JobItemStatus | "", showLoader = false) => {
      if (showLoader) setLoadingItems(true);
      try {
        const response = await getBatch(jobId, status || undefined);
        setActiveJob(response.data.job);
        setItems(response.data.items);
      } catch (err) {
        setError((err as ApiError).message);
      } finally {
        setLoadingItems(false);
      }
    },
    []
  );

  useEffect(() => {
    void refreshJobs();
    void refreshPreview();
  }, [refreshJobs, refreshPreview]);

  useEffect(() => {
    if (activeJob) void refreshActive(activeJob._id, itemFilter, true);
  }, [itemFilter, activeJob?._id, refreshActive]);

  const runLoop = useCallback(
    async (jobId: string) => {
      setRunning(true);
      stopRequested.current = false;
      setError(null);
      let consecutiveErrors = 0;

      try {
        for (;;) {
          if (stopRequested.current) break;

          try {
            const response = await pumpBatch(jobId, PUMP_BUDGET_MS, 0, PUMP_CONCURRENCY);
            consecutiveErrors = 0;
            setRetrying(0);
            await refreshActive(jobId, itemFilter);

            if (response.data.done || response.data.remaining === 0) {
              setMessage(
                `Finished — ${response.data.succeeded} sent, ${response.data.alreadyIssued} already had tickets, ${response.data.skipped} skipped, ${response.data.failed} failed.`
              );
              break;
            }
          } catch (err) {
            consecutiveErrors += 1;
            setRetrying(consecutiveErrors);
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
              setError(
                `${(err as ApiError).message} — stopped after ${consecutiveErrors} retries. Nothing was lost; press Resume to continue.`
              );
              break;
            }
            await wait(Math.min(2 ** consecutiveErrors * 500, 8000));
          }
        }
      } finally {
        setRunning(false);
        setRetrying(0);
        await refreshJobs();
        await refreshPreview();
      }
    },
    [itemFilter, refreshActive, refreshJobs, refreshPreview]
  );

  const start = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const created = await createBatch({ label, allApproved: true });
      const { totalItems, alreadyDelivered, missingEmail } = created.data;
      const notes = [`${totalItems} ticket${totalItems === 1 ? "" : "s"} queued`];
      if (alreadyDelivered > 0) notes.push(`${alreadyDelivered} already delivered, skipped`);
      if (missingEmail > 0) notes.push(`${missingEmail} have no email address`);
      setMessage(notes.join(" · "));
      await refreshJobs();
      await refreshActive(created.data.jobId, itemFilter, true);
      void runLoop(created.data.jobId);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const resume = async (job: Job) => {
    setActiveJob(job);
    await refreshActive(job._id, itemFilter, true);
    void runLoop(job._id);
  };

  const retry = async () => {
    if (!activeJob) return;
    setBusy(true);
    try {
      const response = await retryBatchFailures(activeJob._id);
      setMessage(`Re-queued ${response.data.requeued} failed item(s).`);
      await refreshActive(activeJob._id, itemFilter, true);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    if (!activeJob) return;
    stopRequested.current = true;
    setBusy(true);
    try {
      await cancelBatch(activeJob._id);
      await refreshJobs();
      await refreshActive(activeJob._id, itemFilter);
      await refreshPreview();
    } finally {
      setBusy(false);
    }
  };

  const percent =
    activeJob && activeJob.totalItems > 0
      ? Math.round((activeJob.processed / activeJob.totalItems) * 100)
      : 0;

  const sendLabel = running
    ? "Sending…"
    : preview
      ? `Send ${preview.toSend} ticket${preview.toSend === 1 ? "" : "s"}`
      : "Send to all approved";

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Send tickets</h2>
          <p className="text-sm text-neutral-400">
            Only people who have not received their ticket yet are queued. Safe to stop and resume.
          </p>
        </div>
      </div>

      {preview && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Counter label="To send now" value={preview.toSend} tone="text-white" />
          <Counter
            label="Already delivered"
            value={preview.alreadyDelivered}
            tone="text-sky-400"
          />
          <Counter label="No email" value={preview.missingEmail} tone="text-amber-400" />
          <Counter
            label="Approved people"
            value={preview.approvedRegistrations}
            tone="text-neutral-300"
          />
        </div>
      )}

      {preview && preview.toSend > 0 && (
        <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900">
          <button
            type="button"
            onClick={() => setShowRecipients((value) => !value)}
            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm"
          >
            <span className="text-neutral-200">
              Review the {preview.recipients.length} {preview.recipients.length === 1 ? "person" : "people"} who will be emailed
            </span>
            <span className="text-xs text-neutral-500">{showRecipients ? "Hide" : "Show"}</span>
          </button>

          {showRecipients && (
            <div className="max-h-72 overflow-y-auto border-t border-neutral-800">
              <ul className="divide-y divide-neutral-800/70">
                {preview.recipients.map((recipient: BatchRecipient) => (
                  <li
                    key={recipient.registrationId}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-neutral-200">{recipient.name ?? "Unnamed"}</p>
                      <p className="break-all text-xs text-neutral-500">
                        {recipient.email ?? (
                          <span className="text-amber-400">no email — will be skipped</span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {recipient.sessions
                        .map((session) => (session === "SESSION_1" ? "Session 1" : "Session 2"))
                        .join(" + ")}
                      <span className="ml-1 text-neutral-600">
                        ({recipient.sessions.length} ticket
                        {recipient.sessions.length === 1 ? "" : "s"})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {preview.recipientsTruncated && (
                <p className="px-3 py-2 text-xs text-neutral-500">
                  Showing the first {preview.recipients.length}. All {preview.toSend} tickets will
                  still be sent.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label className="block text-xs uppercase tracking-wide text-neutral-500">
            Batch name
          </label>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={start}
          disabled={busy || running || preview?.toSend === 0}
          className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {(busy || running) && <Spinner />}
          {sendLabel}
        </button>
        {running && (
          <button
            type="button"
            onClick={stop}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:border-red-500"
          >
            Stop
          </button>
        )}
      </div>

      {preview?.toSend === 0 && !running && (
        <p className="mt-3 text-sm text-emerald-400">
          Everyone approved has already received their ticket.
        </p>
      )}
      {retrying > 0 && (
        <p className="mt-3 flex items-center gap-2 text-sm text-amber-400">
          <Spinner /> Connection hiccup — retrying ({retrying}/{MAX_CONSECUTIVE_ERRORS}). Nothing is
          lost.
        </p>
      )}
      {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {activeJob && (
        <div className="mt-5 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-2 font-medium text-white">
                {activeJob.label}
                {running && <Spinner className="h-3 w-3" />}
              </p>
              <p className="text-xs text-neutral-400">
                {activeJob.status} · {activeJob.processed} of {activeJob.totalItems} processed
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeJob.failed > 0 && (
                <button
                  type="button"
                  onClick={retry}
                  disabled={busy || running}
                  className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-200 hover:border-amber-500 disabled:opacity-50"
                >
                  Retry {activeJob.failed} failed
                </button>
              )}
              {!running && activeJob.status === "RUNNING" && (
                <button
                  type="button"
                  onClick={() => resume(activeJob)}
                  className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-500"
                >
                  Resume
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-red-600 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <Counter label="Sent" value={activeJob.succeeded} tone="text-emerald-400" />
            <Counter label="Already issued" value={activeJob.alreadyIssued} tone="text-sky-400" />
            <Counter label="Skipped" value={activeJob.skipped} tone="text-amber-400" />
            <Counter label="Failed" value={activeJob.failed} tone="text-red-400" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(["", "SENT", "SKIPPED", "FAILED", "PENDING"] as const).map((value) => (
              <button
                key={value || "ALL"}
                type="button"
                onClick={() => setItemFilter(value)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  itemFilter === value
                    ? "bg-white text-black"
                    : "border border-neutral-700 text-neutral-300 hover:border-neutral-500"
                }`}
              >
                {value === "" ? "All" : value}
              </button>
            ))}
          </div>

          <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-neutral-800">
            {loadingItems ? (
              <LoadingRow label="Loading items…" />
            ) : (
              <table className="w-full text-left text-sm">
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b border-neutral-900 last:border-0">
                      <td className="px-3 py-2 text-neutral-200">{item.name ?? "—"}</td>
                      <td className="break-all px-3 py-2 text-neutral-400">
                        {item.email ?? "no email"}
                      </td>
                      <td className="px-3 py-2 text-neutral-500">{item.session}</td>
                      <td className="px-3 py-2 font-mono text-xs text-neutral-400">
                        {item.ticketId ?? "—"}
                      </td>
                      <td className={`px-3 py-2 text-xs ${ITEM_STATUS_STYLES[item.status]}`}>
                        {item.status}
                        {item.error && (
                          <span className="ml-1 text-neutral-500">— {item.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                        No items for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Recent batches</p>
        {loadingJobs ? (
          <div className="mt-2">
            <SkeletonRows rows={2} />
          </div>
        ) : jobs.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No batches yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {jobs.slice(0, 5).map((job) => (
              <li
                key={job._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
              >
                <span className="text-neutral-200">{job.label}</span>
                <span className="text-neutral-400">
                  {job.status} · {job.succeeded} sent · {job.failed} failed
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveJob(job);
                    void refreshActive(job._id, itemFilter, true);
                  }}
                  className="text-neutral-400 hover:text-white"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Counter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
