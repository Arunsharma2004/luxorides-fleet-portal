import Link from "next/link";
import VehicleCard from "@/components/VehicleCard";
import VehicleFilters from "@/components/VehicleFilters";
import { ApiError, getVehicles } from "@/lib/api";
import { CATEGORY_OPTIONS } from "@/lib/options";
import { Vehicle } from "@/types";

interface HomeProps {
  searchParams: Promise<{ city?: string; category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { city = "", category = "" } = await searchParams;

  // Ignore a category in the URL that we do not know (the backend would reject it)
  const validCategory = CATEGORY_OPTIONS.find((option) => option.value === category)?.value;

  let vehicles: Vehicle[] = [];
  let errorMessage: string | null = null;

  try {
    vehicles = await getVehicles({ city: city || undefined, category: validCategory });
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "Something went wrong while loading the fleet.";
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Our Fleet</h1>
      <p className="mt-2 text-neutral-400">
        Chauffeur-driven luxury cars across Delhi NCR, Mumbai and Bangalore.
      </p>

      <div className="mt-8">
        <VehicleFilters city={city} category={validCategory ?? ""} />
      </div>

      {errorMessage && (
        <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {errorMessage}
        </div>
      )}

      {!errorMessage && vehicles.length === 0 && (
        <div className="mt-8 rounded-lg border border-neutral-800 p-6 text-neutral-400">
          No vehicles match these filters.{" "}
          <Link href="/" className="text-amber-300 hover:underline">
            Clear filters
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}