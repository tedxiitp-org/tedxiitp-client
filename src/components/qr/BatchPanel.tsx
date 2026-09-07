"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelBatch,
  createBatch,
  getBatch,
  listBatches,
  pumpBatch,
  retryBatchFailures,
  type ApiError,
  type Job,
  type JobItem,
  type JobItemStatus,
} from "@/lib/qr/api";

const ITEM_STATUS_STYLES: Record<JobItemStatus, string> = {
  PENDING: "text-neutral-400",
  PROCESSING: "text-sky-300",
  SENT: "text-emerald-400",
  ALREADY_ISSUED: "text-sky-400",
  FAILED: "text-red-400",
  SKIPPED: "text-amber-400",
};

export default function BatchPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [items, setItems] = useState<JobItem[]>([]);
  const [itemFilter, setItemFilter] = useState<JobItemStatus | "">("");
  const [label, setLabel] = useState("Ticket batch");
  const [throttleMs, setThrottleMs] = useState(1200);
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const stopRequested = useRef(false);

  const refreshJobs = useCallback(async () => {
    try {
      const response = await listBatches();
      setJobs(response.data);
      return response.data;
    } catch (err) {
      setError((err as ApiError).message);
      return [];
    }
  }, []);

  const refreshActive = useCallback(
    async (jobId: string, status?: JobItemStatus | "") => {
      try {
        const response = await getBatch(jobId, status || undefined);
        setActiveJob(response.data.job);
        setItems(response.data.items);
      } catch (err) {
        setError((err as ApiError).message);
      }
    },
    []
  );

  useEffect(() => {
    void refreshJobs();
  }, [refreshJobs]);

  useEffect(() => {
    if (activeJob) void refreshActive(activeJob._id, itemFilter);
  }, [itemFilter, activeJob?._id, refreshActive]);

  const start = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const created = await createBatch({ label, allApproved: true });
      setMessage(
        `Batch created with ${created.data.totalItems} ticket${created.data.totalItems === 1 ? "" : "s"} to send.`
      );
      await refreshJobs();
      await refreshActive(created.data.jobId, itemFilter);
      void runLoop(created.data.jobId);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const runLoop = useCallback(
    async (jobId: string) => {
      setRunning(true);
      stopRequested.current = false;
      setError(null);
      try {
        for (;;) {
          if (stopRequested.current) break;
          const response = await pumpBatch(jobId, 25000, throttleMs);
          await refreshActive(jobId, itemFilter);
          if (response.data.done || response.data.remaining === 0) {
            setMessage(
              `Finished — ${response.data.succeeded} sent, ${response.data.alreadyIssued} already issued, ${response.data.skipped} skipped, ${response.data.failed} failed.`
            );
            break;
          }
        }
      } catch (err) {
        setError((err as ApiError).message);
      } finally {
        setRunning(false);
        await refreshJobs();
      }
    },
    [throttleMs, itemFilter, refreshActive, refreshJobs]
  );

  const resume = async (job: Job) => {
    setActiveJob(job);
    await refreshActive(job._id, itemFilter);
    void runLoop(job._id);
  };

  const retry = async () => {
    if (!activeJob) return;
    setBusy(true);
    try {
      const response = await retryBatchFailures(activeJob._id);
      setMessage(`Re-queued ${response.data.requeued} failed item(s).`);
      await refreshActive(activeJob._id, itemFilter);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    if (!activeJob) return;
    stopRequested.current = true;
    await cancelBatch(activeJob._id);
    await refreshJobs();
    await refreshActive(activeJob._id, itemFilter);
  };

  const percent = activeJob && activeJob.totalItems > 0
    ? Math.round((activeJob.processed / activeJob.totalItems) * 100)
    : 0;

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Send tickets</h2>
          <p className="text-sm text-neutral-400">
            Sends one ticket per approved session. Safe to stop and resume — nobody is emailed twice.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
        <div className="min-w-0">
          <label className="block text-xs uppercase tracking-wide text-neutral-500">
            Batch name
          </label>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none lg:w-auto"
          />
        </div>
        <div className="min-w-0">
          <label className="block text-xs uppercase tracking-wide text-neutral-500">
            Gap between emails
          </label>
          <select
            value={throttleMs}
            onChange={(event) => setThrottleMs(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none lg:w-auto"
          >
            <option value={600}>0.6s — fastest</option>
            <option value={1200}>1.2s — recommended</option>
            <option value={2500}>2.5s — gentle</option>
          </select>
        </div>
        <button
          type="button"
          onClick={start}
          disabled={busy || running}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 sm:w-auto"
        >
          {running ? "Sending…" : "Send to all approved"}
        </button>
        {running && (
          <button
            type="button"
            onClick={stop}
            className="w-full rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:border-red-500 sm:w-auto"
          >
            Stop
          </button>
        )}
      </div>

      {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {activeJob && (
        <div className="mt-5 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-white">{activeJob.label}</p>
              <p className="text-xs text-neutral-400">
                {activeJob.status} · {activeJob.processed} of {activeJob.totalItems} processed
              </p>
            </div>
            <div className="flex gap-2">
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

          <div className="mt-3 hidden max-h-72 overflow-y-auto rounded-lg border border-neutral-800 md:block">
            <table className="w-full text-left text-sm">
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-neutral-900 last:border-0">
                    <td className="px-3 py-2 text-neutral-200">{item.name ?? "—"}</td>
                    <td className="px-3 py-2 text-neutral-400">{item.email ?? "no email"}</td>
                    <td className="px-3 py-2 text-neutral-500">{item.session}</td>
                    <td className="px-3 py-2 font-mono text-xs text-neutral-400">
                      {item.ticketId ?? "—"}
                    </td>
                    <td className={`px-3 py-2 text-xs ${ITEM_STATUS_STYLES[item.status]}`}>
                      {item.status}
                      {item.error && <span className="ml-1 text-neutral-500">— {item.error}</span>}
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
          </div>
        </div>
      )}

      {activeJob && (
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto md:hidden">
          {items.map((item) => (
            <li
              key={item._id}
              className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-neutral-200">{item.name ?? "—"}</span>
                <span className={`text-xs ${ITEM_STATUS_STYLES[item.status]}`}>{item.status}</span>
              </div>
              <p className="mt-1 break-all text-xs text-neutral-400">{item.email ?? "no email"}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {item.session}
                {item.ticketId && (
                  <span className="ml-2 break-all font-mono text-neutral-400">{item.ticketId}</span>
                )}
              </p>
              {item.error && <p className="mt-1 break-words text-xs text-red-400">{item.error}</p>}
            </li>
          ))}
          {items.length === 0 && (
            <li className="rounded-lg border border-dashed border-neutral-800 px-3 py-6 text-center text-neutral-500">
              No items for this filter.
            </li>
          )}
        </ul>
      )}

      {jobs.length > 0 && (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Recent batches</p>
          <ul className="mt-2 space-y-2">
            {jobs.slice(0, 5).map((job) => (
              <li
                key={job._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
              >
                <span className="min-w-0 break-words text-neutral-200">{job.label}</span>
                <span className="text-neutral-400">
                  {job.status} · {job.succeeded} sent · {job.failed} failed
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveJob(job);
                    void refreshActive(job._id, itemFilter);
                  }}
                  className="text-neutral-400 hover:text-white"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
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
