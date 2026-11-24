import { formatRupees } from "@/lib/format";
import { QuoteResponse } from "@/types";

interface PriceSummaryProps {
  quote: QuoteResponse | null;
  loading: boolean;
  error: string | null;
  durationIsValid: boolean;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-neutral-400">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function PriceSummary({ quote, loading, error, durationIsValid }: PriceSummaryProps) {
  return (
    <aside className="h-fit rounded-2xl border border-neutral-800 bg-neutral-900 p-6 lg:sticky lg:top-6">
      <h2 className="text-lg font-semibold">Price summary</h2>

      {!durationIsValid ? (
        <p className="mt-4 text-sm text-amber-300">
          Enter a duration between 1 and 24 hours to see the price.
        </p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-300">{error}</p>
      ) : !quote ? (
        <p className="mt-4 text-sm text-neutral-400">Calculating…</p>
      ) : (
        <dl className={`mt-4 space-y-3 ${loading ? "opacity-60" : ""}`}>
          <Row
            label={`Base package (${quote.includedHours} hrs / 80 km)`}
            value={formatRupees(quote.basePackagePrice)}
          />
          {quote.extraHours > 0 && (
            <Row
              label={`Extra hours (${quote.extraHours} × ${formatRupees(quote.extraHourRate)})`}
              value={formatRupees(quote.extraHoursCharge)}
            />
          )}
          {quote.addOns.map((line) => (
            <Row key={line.addOn} label={line.label} value={formatRupees(line.price)} />
          ))}
          <div className="flex justify-between border-t border-neutral-700 pt-3 text-lg font-semibold">
            <dt>Total</dt>
            <dd className="text-amber-300">{formatRupees(quote.totalFare)}</dd>
          </div>
        </dl>
      )}

      <p className="mt-4 text-xs text-neutral-500">
        The final price is confirmed by our server when you book.
      </p>
    </aside>
  );
}