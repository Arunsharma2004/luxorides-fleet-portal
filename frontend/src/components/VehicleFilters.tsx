"use client";

import { useRouter } from "next/navigation";
import { CATEGORY_OPTIONS, CITIES } from "@/lib/options";

interface VehicleFiltersProps {
  city: string;
  category: string;
}

const selectClass =
  "rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-amber-400 focus:outline-none";

export default function VehicleFilters({ city, category }: VehicleFiltersProps) {
  const router = useRouter();

  // The filters live in the URL, so the page reloads the vehicles from the backend
  function applyFilters(nextCity: string, nextCategory: string) {
    const params = new URLSearchParams();
    if (nextCity) params.set("city", nextCity);
    if (nextCategory) params.set("category", nextCategory);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <label className="flex flex-col gap-1 text-sm text-neutral-400">
        City
        <select
          value={city}
          onChange={(event) => applyFilters(event.target.value, category)}
          className={selectClass}
        >
          <option value="">All cities</option>
          {CITIES.map((cityName) => (
            <option key={cityName} value={cityName}>
              {cityName}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-neutral-400">
        Category
        <select
          value={category}
          onChange={(event) => applyFilters(city, event.target.value)}
          className={selectClass}
        >
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {(city || category) && (
        <button
          type="button"
          onClick={() => applyFilters("", "")}
          className="pb-2 text-sm text-amber-300 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}