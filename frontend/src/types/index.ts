export type Category = "SEDAN" | "SUV" | "ULTRA_LUXURY";

export type AddOn = "CHILD_SEAT" | "AIRPORT_MEET_AND_GREET" | "REFRESHMENTS";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type ChauffeurStatus = "AVAILABLE" | "OFF_DUTY";

export type Role = "CUSTOMER" | "ADMIN";

export interface Vehicle {
  id: number;
  name: string;
  category: Category;
  city: string;
  basePackagePrice: number; // 8 hrs / 80 km
  extraHourRate: number;
}

export interface QuoteRequest {
  vehicleId: number;
  durationHours: number;
  addOns: AddOn[];
}

export interface QuoteAddOnLine {
  addOn: AddOn;
  label: string;
  price: number;
}

export interface QuoteResponse {
  vehicleId: number;
  vehicleName: string;
  durationHours: number;
  basePackagePrice: number;
  includedHours: number;
  extraHours: number;
  extraHourRate: number;
  extraHoursCharge: number;
  addOns: QuoteAddOnLine[];
  addOnsTotal: number;
  totalFare: number;
}

export interface BookingRequest {
  vehicleId: number;
  customerName: string;
  customerPhone: string;
  pickupTime: string; // e.g. "2026-12-01T10:00"
  durationHours: number;
  addOns: AddOn[];
}

export interface Booking {
  id: number;
  vehicleId: number;
  vehicleName: string;
  city: string;
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  durationHours: number;
  endTime: string;
  addOns: AddOn[];
  totalFare: number;
  status: BookingStatus;
  chauffeurId: number | null;
  chauffeurName: string | null;
}

export interface Chauffeur {
  id: number;
  name: string;
  phoneNumber: string;
  city: string;
  status: ChauffeurStatus;
}

export interface LoginResponse {
  token: string;
  role: Role;
  name: string;
}