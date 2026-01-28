export function formatRupiahFromDigits(digits: string) {
  if (!digits) return "";
  const cleaned = digits.replace(/^0+(?=\d)/, ""); // hilangkan leading zero
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // separator ribuan titik
}

export function rupiahTextToNumber(text: string) {
  const digits = (text || "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}
