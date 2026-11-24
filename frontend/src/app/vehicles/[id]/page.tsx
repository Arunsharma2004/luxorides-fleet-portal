import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import { ApiError, getVehicle } from "@/lib/api";
import { formatRupees } from "@/lib/format";
import { categoryLabel } from "@/lib/options";
import { Vehicle } from "@/types";

interface VehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { id } = await params;

  let vehicle: Vehicle;
  try {
    vehicle = await getVehicle(id);
  } catch (error) {
    // Unknown or invalid id: show the standard 404 page
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    return (
      <div>
        <Link href="/" className="text-sm text-neutral-400 hover:text-white">
          ← Back to fleet
        </Link>
        <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error instanceof ApiError ? error.message : "Could not load this vehicle."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/" className="text-sm text-neutral-400 hover:text-white">
        ← Back to fleet
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold">{vehicle.name}</h1>
        <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
          {categoryLabel(vehicle.category)}
        </span>
      </div>
      <p className="mt-1 text-neutral-400">{vehicle.city}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs text-neutral-400">Base package</p>
          <p className="mt-1 text-xl font-semibold text-amber-300">
            {formatRupees(vehicle.basePackagePrice)}
          </p>
          <p className="text-xs text-neutral-500">8 hrs / 80 km</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs text-neutral-400">Extra hour</p>
          <p className="mt-1 text-xl font-semibold">{formatRupees(vehicle.extraHourRate)}</p>
          <p className="text-xs text-neutral-500">per hour beyond 8 hours</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs text-neutral-400">Service</p>
          <p className="mt-1 text-xl font-semibold">Chauffeur-driven</p>
          <p className="text-xs text-neutral-500">Scheduled in advance</p>
        </div>
      </div>

      <div className="mt-10">
        <BookingForm vehicle={vehicle} />
      </div>
    </div>
  );
}