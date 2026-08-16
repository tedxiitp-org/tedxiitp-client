// Minimal CSV parsing for attendee uploads. Handles quoted fields, escaped
// quotes ("") and both \n and \r\n line endings — enough for spreadsheet
// exports without pulling in a dependency.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++; // skip the escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      // Close the field/row on a newline; swallow the \n of a \r\n pair.
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
    } else {
      field += char;
    }
  }

  // Flush trailing field/row if the file didn't end with a newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export interface ParsedAttendee {
  email: string;
  transactionId: string;
  name?: string;
  session: "SESSION_1" | "SESSION_2" | "UNRECOGNIZED";
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Turn raw CSV text into attendee rows. Recognises an optional header row with
 * "email"/"name" columns; otherwise assumes column 1 = email, column 2 = name.
 * Invalid/blank email rows are dropped. De-duplicates by email (case-insensitive).
 */
export function parseAttendeeCsv(text: string): ParsedAttendee[] {
  const rows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ""));
  if (rows.length === 0) return [];

  let emailIdx = 0;
  let nameIdx = 1;
  let txnIdx = -1;
  let sessionIdx = -1;
  let startRow = 0;

  const header = rows[0].map((c) => c.trim().toLowerCase());
  const headerHasEmail = header.some((c) => c === "email" || c === "e-mail");
  if (headerHasEmail) {
    emailIdx = header.findIndex((c) => c === "email" || c === "e-mail");
    const ni = header.findIndex((c) => c === "name" || c === "full name");
    nameIdx = ni === -1 ? -1 : ni;
    const ti = header.findIndex((c) => c === "transaction id" || c === "transactionid" || c === "txn id");
    txnIdx = ti;
    const si = header.findIndex((c) => c === "select session(s)" || c === "session" || c === "sessions");
    sessionIdx = si;
    startRow = 1;
  }

  const seen = new Set<string>();
  const out: ParsedAttendee[] = [];

  for (let i = startRow; i < rows.length; i++) {
    const cols = rows[i];
    const email = (cols[emailIdx] || "").trim();
    if (!EMAIL_RE.test(email)) continue;

    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const name =
      nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx].trim() : undefined;
    
    const transactionId = txnIdx >= 0 && cols[txnIdx] ? cols[txnIdx].trim() : "";
    if (!transactionId) continue; // Skip rows missing transactionId since it's required

    const rawSession = sessionIdx >= 0 && cols[sessionIdx] ? cols[sessionIdx].trim() : "";
    
    if (!rawSession) {
      out.push({ email, transactionId, name: name || undefined, session: "UNRECOGNIZED", message: "Missing session value" });
      continue;
    }

    const parts = rawSession.split(",").map(p => p.trim());
    let recognizedCount = 0;

    for (const part of parts) {
      if (part === "Session 1") {
        out.push({ email, transactionId, name: name || undefined, session: "SESSION_1" });
        recognizedCount++;
      } else if (part === "Session 2") {
        out.push({ email, transactionId, name: name || undefined, session: "SESSION_2" });
        recognizedCount++;
      }
    }

    if (recognizedCount === 0) {
      out.push({ email, transactionId, name: name || undefined, session: "UNRECOGNIZED", message: `Unrecognized session value: "${rawSession}"` });
    }
  }

  return out;
}
