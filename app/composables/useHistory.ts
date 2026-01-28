// app/composables/useHistory.ts
export type HistoryItem = {
  id: string;
  title: string;
  pageSize: string;
  nominal: number;
  createdAt: string; // ISO
  fileName: string;
  pdfBase64: string; // untuk tombol "Lihat PDF"
};

const STORAGE_KEY = "pdf_report_history_v1";

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryItem[];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function formatRupiah(n: number) {
  const v = Math.max(0, Number.isFinite(n) ? n : 0);
  return "Rp " + v.toLocaleString("id-ID");
}

export function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function base64ToBlob(base64: string, mime = "application/pdf") {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
