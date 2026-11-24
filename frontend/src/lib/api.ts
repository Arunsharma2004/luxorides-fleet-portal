import {
  Booking,
  BookingRequest,
  BookingStatus,
  Category,
  Chauffeur,
  LoginResponse,
  QuoteRequest,
  QuoteResponse,
  Vehicle,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Every backend error becomes an ApiError carrying the HTTP status and the backend's message
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Is the backend running?");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // the response had no JSON body; keep the default message
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

// ---- Public ----

export function getVehicles(
  filters: { city?: string; category?: Category } = {}
): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.category) params.set("category", filters.category);
  const query = params.toString();
  return request<Vehicle[]>(`/api/vehicles${query ? `?${query}` : ""}`);
}

export function getVehicle(id: number | string): Promise<Vehicle> {
  return request<Vehicle>(`/api/vehicles/${id}`);
}

export function createQuote(body: QuoteRequest): Promise<QuoteResponse> {
  return request<QuoteResponse>("/api/quotes", { method: "POST", body });
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

// ---- Needs a logged-in user ----

export function createBooking(body: BookingRequest, token: string): Promise<Booking> {
  return request<Booking>("/api/bookings", { method: "POST", body, token });
}

// ---- Admin only ----

export function getBookings(token: string): Promise<Booking[]> {
  return request<Booking[]>("/api/bookings", { token });
}

export function getAvailableChauffeurs(bookingId: number, token: string): Promise<Chauffeur[]> {
  return request<Chauffeur[]>(`/api/chauffeurs/available?bookingId=${bookingId}`, { token });
}

export function assignChauffeur(
  bookingId: number,
  chauffeurId: number,
  token: string
): Promise<Booking> {
  return request<Booking>(`/api/bookings/${bookingId}/chauffeur`, {
    method: "PUT",
    body: { chauffeurId },
    token,
  });
}

export function updateBookingStatus(
  bookingId: number,
  status: BookingStatus,
  token: string
): Promise<Booking> {
  return request<Booking>(`/api/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: { status },
    token,
  });
}