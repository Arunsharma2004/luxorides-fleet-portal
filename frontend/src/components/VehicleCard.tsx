import Link from "next/link";
import { categoryLabel } from "@/lib/options";
import { formatRupees } from "@/lib/format";
import { Vehicle } from "@/types";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-amber-400/60"
    >
      <div>
        <span className="inline-block rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
          {categoryLabel(vehicle.category)}
        </span>
        <h2 className="mt-4 text-xl font-semibold">{vehicle.name}</h2>
        <p className="mt-1 text-sm text-neutral-400">{vehicle.city}</p>
      </div>

      <div className="mt-6">
        <p className="text-2xl font-semibold text-amber-300">
          {formatRupees(vehicle.basePackagePrice)}
        </p>
        <p className="text-xs text-neutral-400">8 hrs / 80 km package</p>
        <p className="mt-1 text-xs text-neutral-500">
          + {formatRupees(vehicle.extraHourRate)} per extra hour
        </p>
        <span className="mt-4 inline-block text-sm font-medium text-amber-300 group-hover:underline">
          View details &amp; book →
        </span>
      </div>
    </Link>
  );
}