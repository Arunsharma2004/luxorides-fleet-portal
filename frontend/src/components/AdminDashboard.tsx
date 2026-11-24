"use client";

import { useEffect, useState } from "react";
import AdminLogin from "@/components/AdminLogin";
import ChauffeurCell from "@/components/ChauffeurCell";
import { ADD_ON_OPTIONS } from "@/lib/addOns";
import { ApiError, getBookings, getErrorMessage, updateBookingStatus } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { formatDateTime, formatRupees } from "@/lib/format";
import { BOOKING_STATUS_OPTIONS } from "@/lib/options";
import { useSession } from "@/lib/useSession";
import { Booking, BookingStatus } from "@/types";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "border-amber-400/50 text-amber-300",
  CONFIRMED: "border-sky-400/50 text-sky-300",
  IN_PROGRESS: "border-violet-400/50 text-violet-300",
  COMPLETED: "border-emerald-400/50 text-emerald-300",
  CANCELLED: "border-red-400/50 text-red-300",
};

// An expired or invalid token logs the admin out; everything else shows the backend's message
function describeError(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    clearSession();
    return "Your session has expired. Please log in again.";
  }
  return getErrorMessage(error);
}

function addOnLabels(booking: Booking): string {
  if (booking.addOns.length === 0) return "-";
  return booking.addOns
    .map((addOn) => ADD_ON_OPTIONS.find((option) => option.value === addOn)?.label ?? addOn)
    .join(", ");
}

export default function AdminDashboard() {
  const session = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const token = session?.token;
  const isAdmin = session?.role === "ADMIN";

  // Load all bookings once an admin is logged in (and again when "Refresh" is clicked)
  useEffect(() => {
    if (!token || !isAdmin) return;

    let cancelled = false;
    async function loadBookings(authToken: string) {
      try {
        const data = await getBookings(authToken);
        if (!cancelled) {
          setBookings(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(describeError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBookings(token);
    return () => {
      cancelled = true;
    };
  }, [token, isAdmin, reloadKey]);

  function refresh() {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  function replaceBooking(updated: Booking) {
    setBookings((current) =>
      current.map((booking) => (booking.id === updated.id ? updated : booking))
    );
    setError(null);
  }

  async function changeStatus(booking: Booking, status: BookingStatus) {
    if (!token) return;
    setUpdatingId(booking.id);
    setError(null);
    try {
      replaceBooking(await updateBookingStatus(booking.id, status, token));
    } catch (err) {
      setError(describeError(err));
    } finally {
      setUpdatingId(null);
    }
  }

  // ---- Not logged in ----
  if (!session) {
    return <AdminLogin notice={error} />;
  }

  // ---- Logged in, but not as an admin ----
  if (!isAdmin) {
    return (
      <div className="max-w-md space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <p className="text-neutral-300">
          You are logged in as <strong>{session.name}</strong>, a customer account. This page is
          for admins only.
        </p>
        <button
          type="button"
          onClick={() => clearSession()}
          className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-400/10"
        >
          Log out and switch to admin
        </button>
      </div>
    );
  }

  // ---- Admin dashboard ----
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-neutral-400">
          {loading ? "Loading…" : `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-neutral-300">
            Logged in as <strong>{session.name}</strong>
          </span>
          <button type="button" onClick={refresh} className="text-amber-300 hover:underline">
            Refresh
          </button>
          <button
            type="button"
            onClick={() => clearSession()}
            className="text-neutral-400 hover:underline"
          >
            Log out
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {!loading && bookings.length === 0 && !error && (
        <div className="rounded-lg border border-neutral-800 p-6 text-neutral-400">
          No bookings yet. Create one from a vehicle page.
        </div>
      )}

      {bookings.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-800">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-neutral-900 text-xs uppercase text-neutral-400">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Pickup &amp; duration</th>
                <th className="px-4 py-3">Add-ons</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Chauffeur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {bookings.map((booking) => (
                <tr key={booking.id} className="align-top">
                  <td className="px-4 py-4 text-neutral-400">#{booking.id}</td>
                  <td className="px-4 py-4">
                    <div>{booking.customerName}</div>
                    <div className="text-xs text-neutral-400">{booking.customerPhone}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div>{booking.vehicleName}</div>
                    <div className="text-xs text-neutral-400">{booking.city}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div>{formatDateTime(booking.pickupTime)}</div>
                    <div className="text-xs text-neutral-400">
                      {booking.durationHours} hrs, ends {formatDateTime(booking.endTime)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-neutral-300">{addOnLabels(booking)}</td>
                  <td className="px-4 py-4 font-semibold">{formatRupees(booking.totalFare)}</td>
                  <td className="px-4 py-4">
                    <select
                      value={booking.status}
                      disabled={updatingId === booking.id}
                      onChange={(event) =>
                        changeStatus(booking, event.target.value as BookingStatus)
                      }
                      className={`rounded-lg border bg-neutral-900 px-2 py-1 text-xs font-medium focus:outline-none disabled:opacity-50 ${STATUS_STYLES[booking.status]}`}
                    >
                      {BOOKING_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <ChauffeurCell
                      booking={booking}
                      token={session.token}
                      onUpdated={replaceBooking}
                      onError={(err) => setError(describeError(err))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}