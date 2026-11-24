"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import PriceSummary from "@/components/PriceSummary";
import { ADD_ON_OPTIONS } from "@/lib/addOns";
import { ApiError, createBooking, createQuote, getErrorMessage, login } from "@/lib/api";
import { clearSession, saveSession } from "@/lib/auth";
import { formatDateTime, formatRupees } from "@/lib/format";
import { useSession } from "@/lib/useSession";
import { AddOn, Booking, QuoteResponse, Vehicle } from "@/types";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-500 [color-scheme:dark] focus:border-amber-400 focus:outline-none";

const errorBoxClass =
  "rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300";

export default function BookingForm({ vehicle }: { vehicle: Vehicle }) {
  const session = useSession();

  // Booking form fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [durationText, setDurationText] = useState("8");
  const [addOns, setAddOns] = useState<AddOn[]>([]);

  // Live quote
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Booking request
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Login box
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const durationHours = Number(durationText);
  const durationIsValid =
    Number.isInteger(durationHours) && durationHours >= 1 && durationHours <= 24;

  // Live quote: ask the backend for the price 300 ms after the user stops changing the inputs
  useEffect(() => {
    if (!durationIsValid) return;

    let cancelled = false; // ignore answers that arrive after the inputs changed again
    const timer = setTimeout(async () => {
      setQuoteLoading(true);
      try {
        const result = await createQuote({ vehicleId: vehicle.id, durationHours, addOns });
        if (!cancelled) {
          setQuote(result);
          setQuoteError(null);
        }
      } catch (error) {
        if (!cancelled) setQuoteError(getErrorMessage(error));
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [vehicle.id, durationHours, addOns, durationIsValid]);

  function toggleAddOn(addOn: AddOn) {
    setAddOns((current) =>
      current.includes(addOn) ? current.filter((item) => item !== addOn) : [...current, addOn]
    );
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const result = await login(email, password);
      saveSession({ token: result.token, role: result.role, name: result.name });
      setPassword("");
    } catch (error) {
      setLoginError(getErrorMessage(error));
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleBook(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    if (!durationIsValid) {
      setBookingError("Duration must be a whole number between 1 and 24 hours.");
      return;
    }

    setSubmitting(true);
    setBookingError(null);
    try {
      const booking = await createBooking(
        {
          vehicleId: vehicle.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          pickupTime,
          durationHours,
          addOns,
        },
        session.token
      );
      setConfirmedBooking(booking);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        setBookingError("Your session has expired. Please log in again.");
      } else {
        // 409 (vehicle busy), 400 (invalid input) and network errors all show the backend's message
        setBookingError(getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Confirmation screen ----
  if (confirmedBooking) {
    const addOnLabels = confirmedBooking.addOns.map(
      (addOn) => ADD_ON_OPTIONS.find((option) => option.value === addOn)?.label ?? addOn
    );

    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8">
        <h2 className="text-2xl font-semibold text-emerald-300">Booking received</h2>
        <p className="mt-2 text-neutral-300">
          Your booking #{confirmedBooking.id} is <strong>{confirmedBooking.status}</strong>. Our
          team will assign a chauffeur shortly.
        </p>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-400">Vehicle</dt>
            <dd>{confirmedBooking.vehicleName}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Pickup</dt>
            <dd>{formatDateTime(confirmedBooking.pickupTime)}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Trip ends</dt>
            <dd>{formatDateTime(confirmedBooking.endTime)}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Duration</dt>
            <dd>{confirmedBooking.durationHours} hours</dd>
          </div>
          {addOnLabels.length > 0 && (
            <div>
              <dt className="text-neutral-400">Add-ons</dt>
              <dd>{addOnLabels.join(", ")}</dd>
            </div>
          )}
          <div>
            <dt className="text-neutral-400">Total fare</dt>
            <dd className="font-semibold text-amber-300">
              {formatRupees(confirmedBooking.totalFare)}
            </dd>
          </div>
        </dl>
        <Link href="/" className="mt-6 inline-block text-amber-300 hover:underline">
          ← Back to fleet
        </Link>
      </div>
    );
  }

  // ---- Booking form ----
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <form
          onSubmit={handleBook}
          className="space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <h2 className="text-xl font-semibold">Book this vehicle</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-neutral-400">
              Your name
              <input
                required
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Full name"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-neutral-400">
              Phone number
              <input
                required
                type="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="10-digit mobile number"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-neutral-400">
              Pickup date and time
              <input
                required
                type="datetime-local"
                value={pickupTime}
                onChange={(event) => setPickupTime(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-neutral-400">
              Duration (hours, 1 to 24)
              <input
                required
                type="number"
                min={1}
                max={24}
                step={1}
                value={durationText}
                onChange={(event) => setDurationText(event.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-sm text-neutral-400">Add-ons</legend>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {ADD_ON_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={addOns.includes(option.value)}
                    onChange={() => toggleAddOn(option.value)}
                    className="accent-amber-400"
                  />
                  {option.label}
                  <span className="text-neutral-400">+{formatRupees(option.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {bookingError && (
            <div role="alert" className={errorBoxClass}>
              {bookingError}
            </div>
          )}

          <button
            type="submit"
            disabled={!session || submitting}
            className="w-full rounded-lg bg-amber-400 px-4 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Booking…" : session ? "Confirm booking" : "Log in below to book"}
          </button>
        </form>

        {session ? (
          <div className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm">
            <span className="text-neutral-300">
              Logged in as <strong>{session.name}</strong> ({session.role.toLowerCase()})
            </span>
            <button
              type="button"
              onClick={() => clearSession()}
              className="text-amber-300 hover:underline"
            >
              Log out
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleLogin}
            className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
          >
            <h2 className="text-lg font-semibold">Log in to book</h2>
            <p className="text-xs text-neutral-500">
              Demo customer: customer@luxorides.com / customer123
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className={inputClass}
              />
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className={inputClass}
              />
            </div>
            {loginError && (
              <div role="alert" className={errorBoxClass}>
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-400/10 disabled:opacity-50"
            >
              {loggingIn ? "Logging in…" : "Log in"}
            </button>
          </form>
        )}
      </div>

      <PriceSummary
        quote={quote}
        loading={quoteLoading}
        error={quoteError}
        durationIsValid={durationIsValid}
      />
    </div>
  );
}