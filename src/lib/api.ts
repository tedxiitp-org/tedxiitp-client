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

export interface CheckDuplicatePayload {
  email: string;
  transactionId: string;
  session: Session | "UNRECOGNIZED";
}

export interface CheckDuplicateResponse {
  email: string;
  session: string;
  exists: boolean;
  reason?: string;
}

export function checkDuplicates(items: CheckDuplicatePayload[]) {
  return request<{ success: boolean; data: CheckDuplicateResponse[] }>(
    "/api/qr/admin/ticket/check-duplicates",
    { method: "POST", body: JSON.stringify({ items }) }
  );
}

export interface BulkJobStatusResponse {
  jobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  totalRecords: number;
  processedRecords: number;
  items: BulkGenerateResult[];
}

export function getBulkJobStatus(jobId: string) {
  return request<{
    success: boolean;
    data: BulkJobStatusResponse;
  }>(`/api/qr/bulk-status/${jobId}`, {
    method: "GET",
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
  role: Role;
  createdAt?: string;
}

export function listVolunteers() {
  return request<{ success: boolean; data: Volunteer[] }>(
    "/api/qr/admin/volunteers",
    { method: "GET" }
  );
}

export function createVolunteer(email: string, password: string) {
  return request<{
    success: boolean;
    message: string;
    data: { id: string; email: string; role: Role };
  }>("/api/qr/admin/volunteers", {
    method: "POST",
    body: JSON.stringify({ email, password }),
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

// ---- Games ----
export interface LeaderboardEntry {
  userId: string;
  username: string;
  cumulativeScore: number;
}

export interface GlobalLeaderboardResponse {
  data: LeaderboardEntry[];
  totalPages: number;
}

export async function registerUser(username: string): Promise<any> {
  return request<any>("/api/v1/users/identity", { method: "POST", body: JSON.stringify({ username }) })
    .then((res) => ({ data: res }))
    .catch((err) => ({ error: err?.message || "Failed to register user. Please try again." }));
}

export async function submitScore(gameId: string, userId: string, score: number): Promise<any> {
  return request(`/api/v1/games/${gameId}/submit-stats`, { method: "POST", body: JSON.stringify({ userId, rawScore: score, timeTaken: score }) })
    .catch((err) => {
      console.error("Score submission error:", err);
      throw err;
    });
}

export async function fetchLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
  return request<{ data: LeaderboardEntry[] }>("/api/v1/leaderboard/" + gameId)
    .then((res) => res.data)
    .catch(() => []);
}

export async function fetchGlobalLeaderboard(page: number, limit: number): Promise<GlobalLeaderboardResponse> {
  return request<GlobalLeaderboardResponse>(`/api/v1/leaderboard/global?page=${page}&limit=${limit}`).catch(() => ({ data: [], totalPages: 1 }));
}
