import { BookingStatus, Category } from "@/types";

export const CITIES = ["Delhi NCR", "Mumbai", "Bangalore"];

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "SEDAN", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "ULTRA_LUXURY", label: "Ultra Luxury" },
];

export function categoryLabel(category: Category): string {
  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;
}

export const BOOKING_STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];