"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Header from "@/src/components/qr/Header";
import { useRequireAuth } from "@/src/lib/qr/auth";
import {
  validateScan,
  type ApiError,
  type Session,
  type ValidationResult,
} from "@/src/lib/qr/api";

// Camera scanner must be client-only (uses navigator.mediaDevices).
const QrScanner = dynamic(() => import("@/src/components/qr/QrScanner"), {
  ssr: false,
});

export default function ScanPage() {
  const { ready } = useRequireAuth(); // both ADMIN and VOLUNTEER may scan

  const [gate, setGate] = useState<Session>("SESSION_1");
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualToken, setManualToken] = useState("");
  const [scannerKey, setScannerKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Loading…</p>
      </main>
    );
  }

  const submitToken = async (token: string) => {
    if (!token.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await validateScan(token.trim(), gate);
      setResult(res);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const resetForNext = () => {
    setResult(null);
    setError(null);
    setManualToken("");
    setScannerKey((k) => k + 1); // re-mount scanner to start camera again
  };

  return (
    <main className="min-h-screen">
      <Header title="Gate Scanner" />
      <div className="mx-auto max-w-md space-y-6 px-6 py-8">
        {/* Gate session selector */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <label className="mb-2 block text-sm text-neutral-300">
            You are scanning for
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["SESSION_1", "SESSION_2"] as Session[]).map((s) => (
              <button
                key={s}
                onClick={() => setGate(s)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  gate === s
                    ? "border-red-600 bg-red-950/40 text-red-300"
                    : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {s === "SESSION_1" ? "Session 1" : "Session 2"}
              </button>
            ))}
          </div>
        </section>

        {/* Result banner */}
        {result && <ResultBanner result={result} onNext={resetForNext} />}
        {error && (
          <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={resetForNext}
              className="mt-3 rounded-md border border-neutral-700 px-4 py-1.5 text-sm hover:bg-neutral-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Scanner / manual entry */}
        {!result && !error && (
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setMode("camera")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm transition ${
                  mode === "camera"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Camera
              </button>
              <button
                onClick={() => setMode("manual")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm transition ${
                  mode === "manual"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Manual
              </button>
            </div>

            {mode === "camera" ? (
              <>
                <QrScanner
                  key={scannerKey}
                  onScan={submitToken}
                  onError={(m) => setError(m)}
                />
                <p className="mt-3 text-center text-xs text-neutral-500">
                  Point the camera at the attendee&apos;s QR code.
                </p>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitToken(manualToken);
                }}
                className="space-y-3"
              >
                <textarea
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste the QR token (JWT) here"
                  rows={4}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-xs outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-md py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
                  style={{ backgroundColor: "var(--tedx-red)" }}
                >
                  {busy ? "Validating…" : "Validate"}
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function ResultBanner({
  result,
  onNext,
}: {
  result: ValidationResult;
  onNext: () => void;
}) {
  const ok = result.success;
  return (
    <section
      className={`rounded-xl border p-6 text-center ${
        ok
          ? "border-green-700 bg-green-950/40"
          : "border-red-800 bg-red-950/40"
      }`}
    >
      <div
        className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-3xl ${
          ok ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {ok ? "✓" : "✕"}
      </div>
      <p
        className={`text-lg font-bold ${
          ok ? "text-green-300" : "text-red-300"
        }`}
      >
        {result.message}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-neutral-400">
        {result.status}
      </p>

      {result.ticket && (
        <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-left text-sm">
          <Row label="Ticket" value={result.ticket.ticketId} mono />
          <Row label="Attendee" value={result.ticket.userId} />
          <Row label="Session" value={result.ticket.session} />
          {result.ticket.checkedInAt && (
            <Row
              label="Checked in"
              value={new Date(result.ticket.checkedInAt).toLocaleString()}
            />
          )}
        </div>
      )}

      <button
        onClick={onNext}
        className="mt-5 w-full rounded-md border border-neutral-600 bg-neutral-900 py-2.5 text-sm font-semibold transition hover:bg-neutral-800"
      >
        Scan next
      </button>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-neutral-500">{label}</span>
      <span className={mono ? "font-mono" : ""}>{value}</span>
    </div>
  );
}
