// server/api/generate-pdf.post.ts
import PDFDocument from "pdfkit";

type Payload = {
  pageSize: string;
  title: string;
  description: string;
  nominal: number;
};

function mapPageSize(size: string) {
  const s = (size || "A4").toUpperCase().trim();
  if (s === "A5") return "A5";
  if (s === "LETTER") return "LETTER";
  return "A4";
}

function formatRupiah(n: number) {
  const v = Math.max(0, Number.isFinite(n) ? n : 0);
  return "Rp " + v.toLocaleString("id-ID");
}

/**
 * PDFKit wrap defaultnya berdasarkan spasi.
 * Kalau ada kata super panjang / URL panjang tanpa spasi, dia bisa “nabrak”.
 * Solusi: pecah token panjang jadi beberapa baris (dengan newline).
 */
function breakLongTokens(text: string, chunkSize = 28) {
  if (!text) return "";

  // split, keep whitespace
  const parts = text.split(/(\s+)/);

  return parts
    .map((p) => {
      if (/^\s+$/.test(p)) return p; // whitespace
      if (p.length <= chunkSize) return p;

      const chunks: string[] = [];
      for (let i = 0; i < p.length; i += chunkSize) {
        chunks.push(p.slice(i, i + chunkSize));
      }
      return chunks.join("\n");
    })
    .join("");
}

function toPdfBuffer(doc: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function safeFileName(title: string) {
  const s = (title || "report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return s || "report";
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as Partial<Payload>;

  const payload: Payload = {
    pageSize: String(body.pageSize || "A4"),
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    nominal: Number(body.nominal ?? 0),
  };

  // ===== Server-side validation =====
  if (!payload.title || payload.title.length < 3) {
    throw createError({
      statusCode: 400,
      statusMessage: "Judul laporan minimal 3 karakter.",
    });
  }
  if (!payload.description || payload.description.length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: "Deskripsi minimal 10 karakter.",
    });
  }
  if (!Number.isFinite(payload.nominal) || payload.nominal < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nominal tidak valid.",
    });
  }

  const size = mapPageSize(payload.pageSize);

  // Margin: A5 lebih kecil biar ruang konten cukup
  const margin = size === "A5" ? 44 : 56;

  const doc = new PDFDocument({
    size,
    margin,
    info: { Title: payload.title },
  });

  // ===== Common geometry =====
  const M = doc.page.margins.left;
  const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Layout tuning
  const titleSize = size === "A5" ? 22 : 26;
  const metaFont = 10;
  const bodyFont = size === "A5" ? 10.5 : 11;

  // Two-column meta positions (disesuaikan untuk A5)
  const leftX = M;
  const rightX = M + W * (size === "A5" ? 0.52 : 0.58);

  // ===== HEADER TITLE =====
  doc
    .font("Helvetica-Bold")
    .fontSize(titleSize)
    .fillColor("#111111")
    .text(payload.title, M, doc.y, { width: W });

  doc.moveDown(0.6);

  // ===== META (2 columns) =====
  const generatedAt = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  doc.font("Helvetica").fontSize(metaFont).fillColor("#444444");

  const metaTopY = doc.y;

  // Left column
  doc.text("Page Size", leftX, metaTopY, { continued: true }).text(`: ${size}`);
  doc
    .text("Generated", leftX, doc.y + 3, { continued: true })
    .text(`: ${generatedAt}`);

  // Right column (start at SAME top Y biar sejajar)
  doc
    .text("Nominal", rightX, metaTopY, { continued: true })
    .text(`: ${formatRupiah(payload.nominal)}`);

  // 🔥 INI FIX UTAMA: pastikan cursor balik ke kiri setelah nulis kolom kanan
  doc.x = M;

  // Pindah y ke bawah baris meta terendah (biar divider nggak nabrak)
  doc.y = Math.max(doc.y, metaTopY + (metaFont + 8) * 2);

  doc.moveDown(0.8);

  // ===== DIVIDER =====
  const lineY = doc.y;
  doc
    .moveTo(M, lineY)
    .lineTo(M + W, lineY)
    .lineWidth(1)
    .strokeColor("#E5E7EB")
    .stroke();

  doc.moveDown(1.0);

  // ===== SECTION TITLE =====
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#111111")
    .text("DESKRIPSI / ISI LAPORAN", M, doc.y, { width: W });

  doc.moveDown(0.5);

  // ===== BODY TEXT =====
  const safeDesc = breakLongTokens(
    payload.description,
    size === "A5" ? 24 : 28,
  );

  doc
    .font("Helvetica")
    .fontSize(bodyFont)
    .fillColor("#111111")
    .text(safeDesc, M, doc.y, {
      width: W,
      align: "left",
      lineGap: 5,
    });

  // ===== OUTPUT =====
  const pdfBuffer = await toPdfBuffer(doc);

  setHeader(event, "Content-Type", "application/pdf");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="${safeFileName(payload.title)}.pdf"`,
  );

  return pdfBuffer;
});
