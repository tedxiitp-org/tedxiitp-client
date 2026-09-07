const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5001";

export type Role = "ADMIN" | "VOLUNTEER";
export type Session = "SESSION_1" | "SESSION_2";

export type ValidationStatus =
  | "SUCCESS"
  | "FAILED_DUPLICATE"
  | "FAILED_REVOKED"
  | "FAILED_INVALID"
  | "FAILED_WRONG_SESSION";

export interface ApiError {
  status: number;
  message: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw {
      status: 0,
      message: "Cannot reach the server. Is the backend running on " + API_URL + "?",
    } as ApiError;
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* no body */
  }

  if (!res.ok) {
    throw {
      status: res.status,
      message: body?.error || body?.message || `Request failed (${res.status})`,
    } as ApiError;
  }

  return body as T;
}

// ---- Auth ----
export function login(email: string, password: string) {
  return request<{ success: boolean; message: string; role: Role }>(
    "/api/qr/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

export function logout() {
  return request<{ success: boolean }>("/api/qr/auth/logout", { method: "POST" });
}

// ---- Admin: Ticket generation ----
export function generateTicket(email: string, session: Session, transactionId: string, name?: string) {
  return request<{
    success: boolean;
    message: string;
    data: {
      ticketId: string;
      qrCode: string;
      qrToken: string;
      emailSent?: boolean;
      emailError?: string;
    };
  }>("/api/qr/generate", {
    method: "POST",
    body: JSON.stringify({ email, session, transactionId, name }),
  });
}

// Revoke by ticketId OR email (one of the two must be provided).
export function revokeTicket(identifier: { ticketId?: string; email?: string }) {
  return request<{ success: boolean; message: string }>(
    "/api/qr/admin/ticket/revoke",
    { method: "PATCH", body: JSON.stringify(identifier) }
  );
}

// ---- Admin: Bulk (CSV) generation & revocation ----
export interface BulkAttendee {
  email: string;
  transactionId: string;
  name?: string;
  session: Session | "UNRECOGNIZED";
}

export interface BulkGenerateResult {
  email: string;
  session: string;
  status: "generated" | "duplicate" | "error";
  ticketId?: string;
  emailSent?: boolean;
  message?: string;
}

export function generateTicketsBulk(
  attendees: BulkAttendee[]
) {
  return request<{
    success: boolean;
    message: string;
    jobId: string;
  }>("/api/qr/generate-bulk", {
    method: "POST",
    body: JSON.stringify({ attendees }),
  });
}

export interface BulkRevokeResult {
  email: string;
  status: "revoked" | "not_found" | "error";
  revokedCount?: number;
  message?: string;
}

export function revokeTicketsBulk(emails: string[]) {
  return request<{
    success: boolean;
    message: string;
    data: BulkRevokeResult[];
  }>("/api/qr/admin/ticket/revoke-bulk", {
    method: "PATCH",
    body: JSON.stringify({ emails }),
  });
}

// ---- Admin: Attendee list (per session) ----
export type Attendance = "ATTENDING" | "ABSENT";

export interface Attendee {
  ticketId: string;
  email: string;
  name: string | null;
  transactionId: string;
  ticketStatus: "ACTIVE" | "REVOKED" | "USED";
  isCheckedIn: boolean;
  attendance: Attendance;
  checkedInAt: string | null;
}

export interface AttendeeSummary {
  total: number;
  attending: number;
  absent: number;
}

export function getAttendees(session: Session) {
  return request<{
    success: boolean;
    data: Attendee[];
    summary: AttendeeSummary;
  }>(`/api/qr/admin/attendees?session=${session}`, { method: "GET" });
}

export async function exportAttendeesCsv(session: Session) {
  const res = await fetch(`${API_URL}/api/qr/admin/attendees/export?session=${session}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw {
      status: res.status,
      message: body?.error || body?.message || "Failed to export attendees",
    } as ApiError;
  }
  return await res.blob();
}

export function getAttendance() {
  return request<{
    success: boolean;
    data: { _id: Session; count: number }[];
  }>("/api/qr/admin/attendance", { method: "GET" });
}

// ---- Admin: Volunteer management ----
export interface Volunteer {
  _id: string;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
  allowedSessions: Session[];
  lastLoginAt: string | null;
  createdAt?: string;
}

export function listVolunteers() {
  return request<{ success: boolean; data: Volunteer[] }>(
    "/api/qr/admin/volunteers",
    { method: "GET" }
  );
}

export function createVolunteer(input: {
  email: string;
  password: string;
  name?: string;
  allowedSessions?: Session[];
}) {
  return request<{
    success: boolean;
    data: { id: string; email: string; role: Role };
  }>("/api/qr/admin/volunteers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteVolunteer(id: string) {
  return request<{ success: boolean; message: string }>(
    `/api/qr/admin/volunteers/${id}`,
    { method: "DELETE" }
  );
}

// ---- Admin: Volunteer scan report ----
export interface VolunteerScanStat {
  scannedById: string;
  email: string;
  role: Role | null;
  total: number;
  success: number;
  duplicate: number;
  revoked: number;
  invalid: number;
  wrongSession: number;
}

export function getVolunteerScanStats() {
  return request<{ success: boolean; data: VolunteerScanStat[] }>(
    "/api/qr/admin/scan-stats",
    { method: "GET" }
  );
}

// ---- Validation (Admin + Volunteer) ----
export interface ValidationResult {
  success: boolean;
  status: ValidationStatus;
  message: string;
  ticket?: {
    ticketId: string;
    userId: string;
    session: Session;
    checkedInAt?: string;
  };
}

// The backend returns HTTP 403 (with a meaningful body) for failed scans such as
// duplicate / revoked / wrong-session. We treat those as normal results, not errors.
export async function validateScan(
  qrToken: string,
  currentScanningSession: Session
): Promise<ValidationResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/qr/validate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken, currentScanningSession }),
    });
  } catch {
    throw {
      status: 0,
      message: "Cannot reach the server. Is the backend running on " + API_URL + "?",
    } as ApiError;
  }

  const body = await res.json().catch(() => null);

  // 401 = not logged in, 500 = server error -> surface as a real error
  if (res.status === 401 || res.status >= 500 || !body) {
    throw {
      status: res.status,
      message: body?.error || body?.message || `Validation failed (${res.status})`,
    } as ApiError;
  }

  return body as ValidationResult;
}

export type TicketTier =
  | "SESSION_1_ONLY"
  | "SESSION_2_ONLY"
  | "BOTH_SESSIONS"
  | "BOTH_SESSIONS_WITH_TSHIRT"
  | "MERCH_ONLY"
  | "UNRECOGNIZED";

export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED" | "DUPLICATE";

export type EmailSource =
  | "EMAIL_COLUMN"
  | "ALT_EMAIL_COLUMN"
  | "INSTITUTE_ID"
  | "MANUAL"
  | "UNRESOLVED";

export interface Registration {
  _id: string;
  sourceRow: number;
  submittedAt: string | null;
  name: string;
  email: string | null;
  emailSource: EmailSource;
  rollNo: string | null;
  instituteId: string | null;
  ticketTypeRaw: string;
  tier: TicketTier;
  sessions: Session[];
  tshirtSize: string | null;
  transactionId: string;
  paymentProofUrl: string | null;
  residesAtIITP: boolean | null;
  aadhaarNumber: string | null;
  aadhaarUrl: string | null;
  address: string | null;
  comments: string | null;
  status: RegistrationStatus;
  flags: string[];
  reviewedAt: string | null;
  reviewNotes: string | null;
  ticketsIssued: number;
}

export interface RegistrationTicket {
  ticketId: string;
  session: Session;
  status: string;
  isCheckedIn: boolean;
  checkedInAt: string | null;
  emailedAt: string | null;
  emailAttempts: number;
  lastEmailError: string | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  pages?: number;
}

export interface RegistrationFilters {
  status?: RegistrationStatus;
  tier?: TicketTier;
  flagged?: "true" | "false";
  includeMerchOnly?: "true" | "false";
  search?: string;
  page?: number;
  pageSize?: number;
}

export function listRegistrations(filters: RegistrationFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return request<{ success: boolean; data: Registration[]; pagination: Pagination }>(
    `/api/registrations${query ? `?${query}` : ""}`,
    { method: "GET" }
  );
}

export function getRegistration(id: string) {
  return request<{
    success: boolean;
    data: { registration: Registration; tickets: RegistrationTicket[] };
  }>(`/api/registrations/${id}`, { method: "GET" });
}

export interface RegistrationStats {
  byStatus: Record<string, number>;
  byTier: Record<string, number>;
  expectedTickets: number;
  issuedTickets: number;
  emailedTickets: number;
  sheetsConfigured: boolean;
}

export function getRegistrationStats() {
  return request<{ success: boolean; data: RegistrationStats }>(
    "/api/registrations/stats",
    { method: "GET" }
  );
}

export interface SyncResult {
  rowsRead: number;
  registrations: number;
  collapsedRows: number;
  created: number;
  updated: number;
  unchanged: number;
  duplicatesMarked: number;
  syncedAt: string;
}

export function syncSheet() {
  return request<{ success: boolean; data: SyncResult }>("/api/registrations/sync", {
    method: "POST",
  });
}

export function importRows(rows: string[][]) {
  return request<{ success: boolean; data: SyncResult }>("/api/registrations/import", {
    method: "POST",
    body: JSON.stringify({ rows }),
  });
}

export function approveRegistration(id: string, notes?: string) {
  return request<{ success: boolean; data: Registration }>(
    `/api/registrations/${id}/approve`,
    { method: "POST", body: JSON.stringify({ notes }) }
  );
}

export function rejectRegistration(id: string, notes?: string) {
  return request<{ success: boolean; data: Registration }>(
    `/api/registrations/${id}/reject`,
    { method: "POST", body: JSON.stringify({ notes }) }
  );
}

export function bulkApproveRegistrations(registrationIds: string[], notes?: string) {
  return request<{ success: boolean; data: { approved: number } }>(
    "/api/registrations/bulk-approve",
    { method: "POST", body: JSON.stringify({ registrationIds, notes }) }
  );
}

export function updateRegistration(id: string, patch: { email?: string; reviewNotes?: string }) {
  return request<{ success: boolean; data: Registration }>(`/api/registrations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export type JobStatus = "PENDING" | "RUNNING" | "PAUSED" | "COMPLETED" | "CANCELLED";

export type JobItemStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "ALREADY_ISSUED"
  | "FAILED"
  | "SKIPPED";

export interface Job {
  _id: string;
  label: string;
  status: JobStatus;
  totalItems: number;
  processed: number;
  succeeded: number;
  alreadyIssued: number;
  failed: number;
  skipped: number;
  createdAt: string;
  completedAt: string | null;
}

export interface JobItem {
  _id: string;
  session: Session;
  email: string | null;
  name: string | null;
  status: JobItemStatus;
  attempts: number;
  ticketId: string | null;
  error: string | null;
}

export interface PumpResult {
  jobId: string;
  status: JobStatus;
  processedThisPump: number;
  succeeded: number;
  alreadyIssued: number;
  failed: number;
  skipped: number;
  remaining: number;
  done: boolean;
}

export function createBatch(input: {
  label: string;
  registrationIds?: string[];
  allApproved?: boolean;
}) {
  return request<{
    success: boolean;
    data: { jobId: string; totalItems: number; registrationsSkipped: number };
  }>("/api/jobs", { method: "POST", body: JSON.stringify(input) });
}

export function pumpBatch(jobId: string, budgetMs?: number, throttleMs?: number) {
  return request<{ success: boolean; data: PumpResult }>(`/api/jobs/${jobId}/pump`, {
    method: "POST",
    body: JSON.stringify({ budgetMs, throttleMs }),
  });
}

export function listBatches() {
  return request<{ success: boolean; data: Job[] }>("/api/jobs", { method: "GET" });
}

export function getBatch(jobId: string, status?: JobItemStatus) {
  const query = status ? `?status=${status}&pageSize=200` : "?pageSize=200";
  return request<{
    success: boolean;
    data: { job: Job; items: JobItem[] };
    pagination: Pagination;
  }>(`/api/jobs/${jobId}${query}`, { method: "GET" });
}

export function retryBatchFailures(jobId: string) {
  return request<{ success: boolean; data: { requeued: number } }>(
    `/api/jobs/${jobId}/retry-failed`,
    { method: "POST" }
  );
}

export function cancelBatch(jobId: string) {
  return request<{ success: boolean }>(`/api/jobs/${jobId}/cancel`, { method: "POST" });
}

export function updateVolunteer(
  id: string,
  patch: { name?: string; password?: string; isActive?: boolean; allowedSessions?: Session[] }
) {
  return request<{ success: boolean; data: Volunteer }>(`/api/qr/admin/volunteers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export interface SyncState {
  lastSyncedAt: string | null;
  lastRowsRead: number;
  lastError: string | null;
  triggeredBy: string;
  mode: "SERVICE_ACCOUNT" | "PUBLIC_LINK" | "NOT_CONFIGURED";
  configured: boolean;
}

export function getSyncState() {
  return request<{ success: boolean; data: SyncState }>("/api/registrations/sync-state", {
    method: "GET",
  });
}

export function autoSync() {
  return request<{
    success: boolean;
    data: { ran: boolean; reason?: string };
  }>("/api/registrations/auto-sync", { method: "POST" });
}
