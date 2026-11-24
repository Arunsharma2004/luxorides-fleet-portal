import { API_URL, DEMO_ADMIN } from "./config";

export type BookingStatus = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Chauffeur {
  id: number;
  name: string;
  phoneNumber: string;
  city: string;
}

export interface Trip {
  id: number;
  vehicleName: string;
  city: string;
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  durationHours: number;
  endTime: string;
  status: BookingStatus;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

  // Give up after 10 seconds so a wrong address shows an error instead of loading forever
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const data = await response.json();
        if (data?.message) message = data.message;
      } catch {
        // no JSON body; keep the default message
      }
      throw new Error(message);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The server took too long to answer. Check the API address and the Wi-Fi.");
    }
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot reach the server. Check that the backend is running and the address in src/config.ts is correct."
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function loginAsAdmin(): Promise<string> {
  const result = await request<{ token: string }>("/api/auth/login", {
    method: "POST",
    body: DEMO_ADMIN,
  });
  return result.token;
}

export function getChauffeurs(token: string): Promise<Chauffeur[]> {
  return request<Chauffeur[]>("/api/chauffeurs", { token });
}

export function getTrips(chauffeurId: number, token: string): Promise<Trip[]> {
  return request<Trip[]>(`/api/chauffeurs/${chauffeurId}/trips`, { token });
}

export function updateTripStatus(tripId: number, status: BookingStatus, token: string): Promise<Trip> {
  return request<Trip>(`/api/bookings/${tripId}/status`, {
    method: "PATCH",
    body: { status },
    token,
  });
}