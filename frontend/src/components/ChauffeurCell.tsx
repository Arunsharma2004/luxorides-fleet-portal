"use client";

import { useState } from "react";
import { assignChauffeur, getAvailableChauffeurs } from "@/lib/api";
import { Booking, Chauffeur } from "@/types";

interface ChauffeurCellProps {
  booking: Booking;
  token: string;
  onUpdated: (booking: Booking) => void;
  onError: (error: unknown) => void;
}

export default function ChauffeurCell({ booking, token, onUpdated, onError }: ChauffeurCellProps) {
  const [choosing, setChoosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<Chauffeur[]>([]);
  const [selectedId, setSelectedId] = useState("");

  // Only load the available chauffeurs when the admin asks for them
  async function startChoosing() {
    setChoosing(true);
    setLoading(true);
    try {
      const available = await getAvailableChauffeurs(booking.id, token);
      setOptions(available);
      setSelectedId(available.length > 0 ? String(available[0].id) : "");
    } catch (error) {
      onError(error);
      setChoosing(false);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!selectedId) return;
    setSaving(true);
    try {
      const updated = await assignChauffeur(booking.id, Number(selectedId), token);
      onUpdated(updated);
      setChoosing(false);
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  }

  if (!choosing) {
    return (
      <div className="flex flex-col items-start gap-1">
        {booking.chauffeurName ? (
          <span>{booking.chauffeurName}</span>
        ) : (
          <span className="text-neutral-500">Unassigned</span>
        )}
        <button
          type="button"
          onClick={startChoosing}
          className="text-xs text-amber-300 hover:underline"
        >
          {booking.chauffeurName ? "Change" : "Assign chauffeur"}
        </button>
      </div>
    );
  }

  if (loading) {
    return <span className="text-xs text-neutral-400">Loading chauffeurs…</span>;
  }

  if (options.length === 0) {
    return (
      <div className="flex flex-col items-start gap-1 text-xs">
        <span className="text-neutral-400">
          No chauffeur is available in {booking.city} for this time.
        </span>
        <button
          type="button"
          onClick={() => setChoosing(false)}
          className="text-amber-300 hover:underline"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        value={selectedId}
        onChange={(event) => setSelectedId(event.target.value)}
        className="rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100 focus:border-amber-400 focus:outline-none"
      >
        {options.map((chauffeur) => (
          <option key={chauffeur.id} value={chauffeur.id}>
            {chauffeur.name} ({chauffeur.phoneNumber})
          </option>
        ))}
      </select>
      <div className="flex gap-3 text-xs">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="font-medium text-amber-300 hover:underline disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setChoosing(false)}
          className="text-neutral-400 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}