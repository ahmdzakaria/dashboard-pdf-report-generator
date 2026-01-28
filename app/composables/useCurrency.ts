// app/composables/useCurrency.ts
export function formatRupiahFromDigits(input: string) {
  const digits = (input || "").replace(/\D/g, "");
  if (!digits) return "";
  const normalized = digits.replace(/^0+(?=\d)/, "");
  const formatted = normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${formatted}`;
}

export function rupiahTextToNumber(text: string) {
  if (!text) return 0;
  const digits = text.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}
