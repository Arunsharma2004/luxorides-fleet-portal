import { useMemo, useSyncExternalStore } from "react";
import { AuthSession, parseSession, readRawSession, subscribeToSession } from "@/lib/auth";

// The logged-in user (or null), kept in sync with the browser's saved login
export function useSession(): AuthSession | null {
  const raw = useSyncExternalStore(subscribeToSession, readRawSession, () => null);
  return useMemo(() => parseSession(raw), [raw]);
}