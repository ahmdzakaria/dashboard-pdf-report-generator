// server/api/generate-pdf.post.ts
import PDFDocument from "pdfkit";

type Payload = {
  pageSize: string;
  title: string;
  description: string;
  nominal: number;
};

function mapPageSize(size: string) {
  const s = (size || "A4").toUpperCase();
  if (s === "A5") return "A5";
  if (s === "LETTER") return "LETTER";
  return "A4";
}

function formatRupiah(n: number) {
  const v = Math.max(0, Number.isFinite(n) ? n : 0);
  return "Rp " + v.toLocaleString("id-ID");
}

function bufferFromPdf(doc: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as Partial<Payload>;

  const payload: Payload = {
    pageSize: String(body.pageSize || "A4"),
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    nominal: Number(body.nominal || 0),
  };

  // Server validation
  if (!payload.title || payload.title.length < 5) {
    throw createError({
      statusCode: 400,
      statusMessage: "Judul laporan minimal 5 karakter.",
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

  const doc = new PDFDocument({ size, margin: 50 });
  doc.fontSize(18).text(payload.title);
  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .fillColor("#666")
    .text(
      `Page Size: ${payload.pageSize} • Nominal: ${formatRupiah(payload.nominal)}`,
    )
    .text(`Generated: ${new Date().toLocaleString("id-ID")}`);

  doc.moveDown(1);
  doc
    .fillColor("#000")
    .fontSize(12)
    .text("Deskripsi / Isi Laporan", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).text(payload.description, { lineGap: 4 });

  const pdfBuffer = await bufferFromPdf(doc);

  setHeader(event, "Content-Type", "application/pdf");
  setHeader(event, "Content-Disposition", 'attachment; filename="report.pdf"');
  return pdfBuffer;
});
