import { Category } from "@/types";

export const CITIES = ["Delhi NCR", "Mumbai", "Bangalore"];

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "SEDAN", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "ULTRA_LUXURY", label: "Ultra Luxury" },
];

export function categoryLabel(category: Category): string {
  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;
}