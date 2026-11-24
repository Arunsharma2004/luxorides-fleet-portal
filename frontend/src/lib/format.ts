const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatRupees(amount: number): string {
  return rupeeFormatter.format(amount);
}

// The backend sends times like "2026-12-01T10:00:00" (Indian time, no timezone)
export function formatDateTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}