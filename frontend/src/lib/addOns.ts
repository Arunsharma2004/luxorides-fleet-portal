import { AddOn } from "@/types";

// Mirrors the backend AddOn enum, used to draw the checkboxes.
// The price the customer pays always comes from the backend quote.
export const ADD_ON_OPTIONS: { value: AddOn; label: string; price: number }[] = [
  { value: "CHILD_SEAT", label: "Child Seat", price: 500 },
  { value: "AIRPORT_MEET_AND_GREET", label: "Airport Meet & Greet", price: 1000 },
  { value: "REFRESHMENTS", label: "Water & Refreshments", price: 300 },
];